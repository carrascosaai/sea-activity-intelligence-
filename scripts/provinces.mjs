// Capitales de provincia (aprox.) + comunidad autónoma. Se usa para asignar
// provincia/región a cada playa por heurística de "capital más cercana" —
// no es una asignación administrativa exacta (no hacemos point-in-polygon
// contra los límites reales), pero es suficientemente buena para agrupar y
// buscar playas a nivel nacional en el MVP. Ver scripts/generate-beaches.mjs.
export const PROVINCES = [
  { name: "Almería", region: "Andalucía", lat: 36.8381, lon: -2.4597 },
  { name: "Cádiz", region: "Andalucía", lat: 36.5271, lon: -6.2886 },
  { name: "Córdoba", region: "Andalucía", lat: 37.8882, lon: -4.7794 },
  { name: "Granada", region: "Andalucía", lat: 37.1773, lon: -3.5986 },
  { name: "Huelva", region: "Andalucía", lat: 37.2614, lon: -6.9447 },
  { name: "Jaén", region: "Andalucía", lat: 37.7796, lon: -3.7849 },
  { name: "Málaga", region: "Andalucía", lat: 36.7213, lon: -4.4213 },
  { name: "Sevilla", region: "Andalucía", lat: 37.3891, lon: -5.9845 },
  { name: "Huesca", region: "Aragón", lat: 42.1401, lon: -0.4089 },
  { name: "Teruel", region: "Aragón", lat: 40.3456, lon: -1.1065 },
  { name: "Zaragoza", region: "Aragón", lat: 41.6488, lon: -0.8891 },
  { name: "Asturias", region: "Asturias", lat: 43.3619, lon: -5.8494 },
  { name: "Illes Balears", region: "Islas Baleares", lat: 39.5696, lon: 2.6502 },
  { name: "Las Palmas", region: "Canarias", lat: 28.1235, lon: -15.4363 },
  { name: "Santa Cruz de Tenerife", region: "Canarias", lat: 28.4636, lon: -16.2518 },
  { name: "Cantabria", region: "Cantabria", lat: 43.4623, lon: -3.8099 },
  { name: "Albacete", region: "Castilla-La Mancha", lat: 38.9943, lon: -1.8585 },
  { name: "Ciudad Real", region: "Castilla-La Mancha", lat: 38.9848, lon: -3.9272 },
  { name: "Cuenca", region: "Castilla-La Mancha", lat: 40.0704, lon: -2.1374 },
  { name: "Guadalajara", region: "Castilla-La Mancha", lat: 40.6333, lon: -3.1669 },
  { name: "Toledo", region: "Castilla-La Mancha", lat: 39.8628, lon: -4.0273 },
  { name: "Ávila", region: "Castilla y León", lat: 40.6566, lon: -4.6812 },
  { name: "Burgos", region: "Castilla y León", lat: 42.3439, lon: -3.6969 },
  { name: "León", region: "Castilla y León", lat: 42.5987, lon: -5.5671 },
  { name: "Palencia", region: "Castilla y León", lat: 42.0096, lon: -4.5288 },
  { name: "Salamanca", region: "Castilla y León", lat: 40.9701, lon: -5.6635 },
  { name: "Segovia", region: "Castilla y León", lat: 40.9429, lon: -4.1088 },
  { name: "Soria", region: "Castilla y León", lat: 41.7636, lon: -2.4649 },
  { name: "Valladolid", region: "Castilla y León", lat: 41.6523, lon: -4.7245 },
  { name: "Zamora", region: "Castilla y León", lat: 41.5033, lon: -5.7446 },
  { name: "Barcelona", region: "Cataluña", lat: 41.3851, lon: 2.1734 },
  { name: "Girona", region: "Cataluña", lat: 41.9794, lon: 2.8214 },
  { name: "Lleida", region: "Cataluña", lat: 41.6176, lon: 0.62 },
  { name: "Tarragona", region: "Cataluña", lat: 41.1189, lon: 1.2445 },
  { name: "Alicante", region: "Comunidad Valenciana", lat: 38.3452, lon: -0.481 },
  { name: "Castellón", region: "Comunidad Valenciana", lat: 39.9864, lon: -0.0513 },
  { name: "Valencia", region: "Comunidad Valenciana", lat: 39.4699, lon: -0.3763 },
  { name: "Badajoz", region: "Extremadura", lat: 38.8794, lon: -6.9707 },
  { name: "Cáceres", region: "Extremadura", lat: 39.4753, lon: -6.3724 },
  { name: "A Coruña", region: "Galicia", lat: 43.3623, lon: -8.4115 },
  { name: "Lugo", region: "Galicia", lat: 43.0121, lon: -7.556 },
  { name: "Ourense", region: "Galicia", lat: 42.34, lon: -7.8639 },
  { name: "Pontevedra", region: "Galicia", lat: 42.431, lon: -8.6444 },
  { name: "Madrid", region: "Comunidad de Madrid", lat: 40.4168, lon: -3.7038 },
  { name: "Murcia", region: "Región de Murcia", lat: 37.9922, lon: -1.1307 },
  { name: "Navarra", region: "Comunidad Foral de Navarra", lat: 42.8125, lon: -1.6458 },
  { name: "Álava", region: "País Vasco", lat: 42.8467, lon: -2.6716 },
  { name: "Gipuzkoa", region: "País Vasco", lat: 43.3183, lon: -1.9812 },
  { name: "Bizkaia", region: "País Vasco", lat: 43.263, lon: -2.935 },
  { name: "La Rioja", region: "La Rioja", lat: 42.4627, lon: -2.4449 },
  { name: "Ceuta", region: "Ceuta", lat: 35.8894, lon: -5.3213 },
  { name: "Melilla", region: "Melilla", lat: 35.2923, lon: -2.9381 },
];

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Ceuta y Melilla son enclaves diminutos separados del resto de España por
// mar: la distancia en línea recta las hace "ganar" por cercanía a playas de
// la costa gaditana/malagueña (p. ej. Tarifa) que en realidad no tienen
// conexión terrestre con ellas. Solo se asignan si el punto está realmente
// dentro de su enclave (radio ~8km).
const EXCLAVE_RADIUS_KM = 8;
const EXCLAVE_NAMES = new Set(["Ceuta", "Melilla"]);

export function nearestProvince(lat, lon) {
  let best = null;
  let bestDist = Infinity;
  for (const p of PROVINCES) {
    if (EXCLAVE_NAMES.has(p.name)) continue;
    const d = haversineKm(lat, lon, p.lat, p.lon);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  for (const p of PROVINCES) {
    if (!EXCLAVE_NAMES.has(p.name)) continue;
    const d = haversineKm(lat, lon, p.lat, p.lon);
    if (d <= EXCLAVE_RADIUS_KM && d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}
