"use client";

import { useEffect, useState } from "react";

// Sustituye a la ilustración vectorial (HeroIllustration.tsx, ya no se usa)
// tras feedback directo: una escena dibujada de sol+olas+velero es
// exactamente el tipo de imagen "de plantilla genérica" que cualquier
// generador de webs pone por defecto. Esto son fotos reales de playas
// reales (Wikimedia Commons, mismo pipeline que BeachPhoto.tsx, con
// atribución real), rotando cada 10s para que no sea "una foto" sino
// "toda la costa española" — coherente con lo que la propia web promete.
// A 1280px porque el proxy de miniaturas de Wikimedia (thumb.wikimedia.org)
// solo sirve los anchos que ya tiene cacheados de antes (los que pidió
// scripts/generate-beach-photos.mjs) — pedir un ancho distinto (probado con
// 640px) devuelve 400. Un velo de color en los tonos de marca (teal/azul)
// ancla las fotos al resto de la interfaz.
const PHOTOS = [
  {
    thumbUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/El_Palmar_Beach%2C_April_2014.jpg/1280px-El_Palmar_Beach%2C_April_2014.jpg",
    author: "Andreas Ostheimer",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:El_Palmar_Beach,_April_2014.jpg",
    alt: "Playa de El Palmar, Cádiz, con olas rompiendo en la orilla",
  },
  {
    thumbUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/Cala_del_Aceite_Conil_071gm.jpg/1280px-Cala_del_Aceite_Conil_071gm.jpg",
    author: "Martin Haisch",
    license: "CC BY-SA 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cala_del_Aceite_Conil_071gm.jpg",
    alt: "Acantilados ocres de Cala del Aceite, Conil de la Frontera",
  },
  {
    thumbUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/Playa_de_Rodiles_%2C_Villaviciosa._-_panoramio.jpg/1280px-Playa_de_Rodiles_%2C_Villaviciosa._-_panoramio.jpg",
    author: "McBodes",
    license: "CC BY 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Playa_de_Rodiles_,_Villaviciosa._-_panoramio.jpg",
    alt: "Playa de Rodiles, Villaviciosa, Asturias",
  },
  {
    thumbUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Playa_de_Patos_-_panoramio.jpg/1280px-Playa_de_Patos_-_panoramio.jpg",
    author: "Anxo Soto",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Playa_de_Patos_-_panoramio.jpg",
    alt: "Atardecer en Playa de Patos, Nigrán",
  },
  {
    thumbUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Playa_de_la_Misericordia%2C_Spain_%28Unsplash_mBQIfKlvowM%29.jpg/1280px-Playa_de_la_Misericordia%2C_Spain_%28Unsplash_mBQIfKlvowM%29.jpg",
    author: "Quino Al",
    license: "CC0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Playa_de_la_Misericordia,_Spain_(Unsplash_mBQIfKlvowM).jpg",
    alt: "Amanecer en Playa de la Misericordia, Málaga",
  },
  {
    thumbUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Cala_Macarella_2.jpg/1280px-Cala_Macarella_2.jpg",
    author: "Marcelsala007",
    license: "CC BY-SA 3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cala_Macarella_2.jpg",
    alt: "Aguas turquesas de Cala Macarella, Menorca",
  },
  {
    thumbUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Sunset_from_Zurriola_Beach.jpg/1280px-Sunset_from_Zurriola_Beach.jpg",
    author: "Lino Uruñuela",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sunset_from_Zurriola_Beach.jpg",
    alt: "Anochecer en la playa de Zurriola, Donostia-San Sebastián",
  },
];

export function HeroPhoto() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % PHOTOS.length), 10000);
    return () => clearInterval(id);
  }, []);

  const current = PHOTOS[index];

  return (
    <figure className="relative h-40 overflow-hidden">
      {PHOTOS.map((photo, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- fuente externa (Wikimedia), fuera del dominio propio
        <img
          key={photo.sourceUrl}
          src={photo.thumbUrl}
          alt={photo.alt}
          className={`absolute inset-0 w-full h-full object-cover object-[50%_30%] transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* Velo de color en los tonos de marca — ancla las fotos a la paleta
          teal/azul del resto de la interfaz en vez de dejarlas "pegadas". */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/35 via-transparent to-accent-2/30 mix-blend-color" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      <figcaption className="absolute bottom-1 right-2">
        <a
          href={current.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-white/70 hover:text-white transition-colors"
        >
          Foto: {current.author} · {current.license} · Wikimedia Commons
        </a>
      </figcaption>
    </figure>
  );
}
