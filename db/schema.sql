-- Sea Activity Intelligence — esquema inicial (Supabase / PostgreSQL)
-- Ver brief punto 15 y README.md. Deliberadamente sencillo para el MVP:
-- no hay login obligatorio, así que `users` y `favorites` usan un
-- identificador de dispositivo/sesión anónimo en vez de auth obligatoria.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists locations (
  slug text primary key,
  name text not null,
  municipality text,
  province text not null,
  region text not null,
  lat double precision not null,
  lon double precision not null,
  popular boolean not null default false
);

create index if not exists idx_locations_region on locations (region);
create index if not exists idx_locations_popular on locations (popular) where popular;

create table if not exists activities (
  id text primary key, -- 'paddle-surf' | 'surf' | 'kayak' | ...
  name text not null,
  emoji text
);

-- Reglas de scoring versionadas por actividad + nivel (ver lib/scoring/config.ts).
-- Se persisten para poder ajustarlas con datos reales sin desplegar código
-- (VALIDATION.md, riesgo "reglas de scoring arbitrarias al inicio").
create table if not exists activity_rules (
  id uuid primary key default gen_random_uuid(),
  activity_id text not null references activities(id),
  skill_level text not null check (skill_level in ('principiante', 'intermedio', 'avanzado')),
  rules jsonb not null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  unique (activity_id, skill_level, version)
);

create table if not exists weather_forecasts (
  id uuid primary key default gen_random_uuid(),
  location_slug text not null references locations(slug),
  forecast_time timestamptz not null,
  air_temp_c double precision,
  wind_speed_kmh double precision,
  wind_direction_deg double precision,
  precipitation_probability_pct double precision,
  precipitation_mm double precision,
  weather_code int,
  visibility_m double precision,
  source text not null default 'open-meteo',
  fetched_at timestamptz not null default now(),
  unique (location_slug, forecast_time, source)
);

create table if not exists marine_forecasts (
  id uuid primary key default gen_random_uuid(),
  location_slug text not null references locations(slug),
  forecast_time timestamptz not null,
  wave_height_m double precision,
  wave_direction_deg double precision,
  wave_period_s double precision,
  water_temp_c double precision,
  source text not null default 'open-meteo-marine',
  fetched_at timestamptz not null default now(),
  unique (location_slug, forecast_time, source)
);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  location_slug text not null references locations(slug),
  activity_id text not null references activities(id),
  skill_level text not null check (skill_level in ('principiante', 'intermedio', 'avanzado')),
  forecast_time timestamptz not null,
  score int not null check (score between 0 and 100),
  band text not null check (band in ('green', 'yellow', 'red')),
  reasons jsonb not null default '[]',
  computed_at timestamptz not null default now()
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  session_id text not null, -- id de dispositivo/sesión anónima (sin login obligatorio)
  user_id uuid references users(id),
  location_slug text not null references locations(slug),
  activity_id text not null references activities(id),
  created_at timestamptz not null default now()
);

-- Negocios locales (escuelas, alquileres, centros de buceo...) para leads/afiliación (P1).
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_slug text not null references locations(slug),
  activities text[] not null default '{}',
  contact_url text,
  created_at timestamptz not null default now()
);

create table if not exists booking_links (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id),
  activity_id text not null references activities(id),
  url text not null,
  is_affiliate boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null, -- location_selected, activity_selected, skill_selected,
                             -- forecast_viewed, recommendation_viewed, location_clicked,
                             -- business_clicked, booking_clicked, favorite_created,
                             -- recommendation_feedback (payload: {..., helpful: boolean} —
                             -- señal real para validar/ajustar lib/scoring/profiles.ts)
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Límite de peticiones por IP en las rutas públicas (ver lib/rateLimit.ts).
create table if not exists rate_limits (
  key text primary key,
  count int not null default 1,
  window_start timestamptz not null default now()
);

-- Caché de previsión precalculada (ver lib/cache/forecastCache.ts y
-- app/api/cron/refresh-cache/route.ts) — evita depender solo del caché de
-- 30 min de Next.js cuando hay tráfico alto en las playas más visitadas.
create table if not exists forecast_cache (
  id uuid primary key default gen_random_uuid(),
  location_slug text not null references locations(slug),
  date_iso date not null,
  snapshots jsonb not null,
  fetched_at timestamptz not null default now(),
  unique (location_slug, date_iso)
);
create index if not exists idx_forecast_cache_location_date on forecast_cache (location_slug, date_iso);

-- Valoraciones de la propia comunidad para las tiendas/centros de deportes
-- acuáticos (dataset real de OSM, ver scripts/generate-shops.mjs y
-- lib/shops.ts). Distinto de `businesses`/`booking_links` (P1, negocios
-- afiliados dados de alta a mano): esto es cualquier tienda real detectada
-- automáticamente, puntuable por cualquier usuario. No inventamos estrellas
-- de Google — este es el mecanismo honesto de "estrellas propias" que se va
-- llenando con tráfico real (mismo patrón que analytics_events/feedback).
create table if not exists shop_ratings (
  id uuid primary key default gen_random_uuid(),
  shop_slug text not null,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);
create index if not exists idx_shop_ratings_slug on shop_ratings (shop_slug);

-- Reportes reales de la comunidad ("hoy había resaca aunque el score decía
-- bueno", "aquí se pesca bien con levante"...). Sustituto honesto de
-- "opiniones de internet": no se puede rastrear en bloque TripAdvisor/Google
-- (viola sus condiciones de uso y no hay forma fiable de que una IA decida
-- qué opinión corrige qué dato), así que en vez de eso dejamos que la propia
-- comunidad de la web escriba notas reales, visibles para todos, que se van
-- acumulando con tráfico real — mismo patrón que shop_ratings/feedback.
-- Contenido público sin moderar más allá del límite de longitud y el
-- límite de peticiones (ver lib/rateLimit.ts).
create table if not exists community_reports (
  id uuid primary key default gen_random_uuid(),
  location_slug text not null references locations(slug),
  activity_id text references activities(id), -- null = nota general, no ligada a un deporte
  body text not null check (char_length(body) between 3 and 280),
  created_at timestamptz not null default now()
);
create index if not exists idx_community_reports_location on community_reports (location_slug, created_at desc);

create index if not exists idx_weather_forecasts_location_time on weather_forecasts (location_slug, forecast_time);
create index if not exists idx_marine_forecasts_location_time on marine_forecasts (location_slug, forecast_time);
create index if not exists idx_recommendations_location_activity on recommendations (location_slug, activity_id, forecast_time);
create index if not exists idx_analytics_events_name_time on analytics_events (event_name, created_at);

insert into activities (id, name, emoji) values
  ('surf', 'Surf', '🏄'),
  ('paddle-surf', 'Paddle Surf', '🏄‍♂️'),
  ('bodyboard', 'Bodyboard', '🏄‍♀️'),
  ('kitesurf', 'Kitesurf', '🪁'),
  ('windsurf', 'Windsurf', '🎏'),
  ('wingfoil', 'Wingfoil', '🦅'),
  ('kayak', 'Kayak', '🛶'),
  ('remo', 'Remo', '🚣'),
  ('vela', 'Vela / Navegación', '⛵'),
  ('buceo', 'Buceo', '🤿'),
  ('snorkel', 'Snorkel', '🐠'),
  ('apnea', 'Apnea / Buceo libre', '🫁'),
  ('esqui-acuatico', 'Esquí acuático', '🎿'),
  ('wakeboard', 'Wakeboard', '🏂'),
  ('moto-agua', 'Moto de agua', '🚤'),
  ('flyboard', 'Flyboard', '🚀'),
  ('pesca', 'Pesca', '🎣'),
  ('coasteering', 'Coasteering', '🧗'),
  ('bano', 'Baño en la playa', '🏖️'),
  ('natacion-aguas-abiertas', 'Natación en aguas abiertas', '🏊')
on conflict (id) do nothing;

-- Las ~3.600 playas de España (src/data/beaches.json, generado por
-- scripts/generate-beaches.mjs desde OpenStreetMap) se cargan con
-- `node scripts/seed-supabase.mjs` una vez configuradas SUPABASE_URL y
-- SUPABASE_SERVICE_ROLE_KEY — no tiene sentido mantener 3.600 INSERT a mano
-- en este archivo.
