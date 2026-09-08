// Sustituye a la ilustración vectorial (HeroIllustration.tsx, ya no se usa)
// tras feedback directo: una escena dibujada de sol+olas+velero es
// exactamente el tipo de imagen "de plantilla genérica" que cualquier
// generador de webs pone por defecto. Esto es una foto real de una playa
// real (El Palmar, Cádiz — spot de surf conocido, Wikimedia Commons,
// mismo pipeline que BeachPhoto.tsx), con un velo de color en los tonos
// de marca (teal/azul) en vez de mostrarla en crudo — ancla la foto al
// resto de la interfaz sin que parezca un stock genérico pegado encima.
const PHOTO = {
  thumbUrl:
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/El_Palmar_Beach%2C_April_2014.jpg/1280px-El_Palmar_Beach%2C_April_2014.jpg",
  width: 1280,
  height: 960,
  author: "Andreas Ostheimer",
  license: "CC BY-SA 4.0",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:El_Palmar_Beach,_April_2014.jpg",
};

export function HeroPhoto() {
  return (
    <figure className="relative h-40 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- fuente externa (Wikimedia), fuera del dominio propio */}
      <img
        src={PHOTO.thumbUrl}
        alt="Playa de El Palmar, Cádiz, con olas rompiendo en la orilla"
        width={PHOTO.width}
        height={PHOTO.height}
        className="w-full h-full object-cover object-[50%_30%]"
      />
      {/* Velo de color en los tonos de marca — ancla la foto a la paleta
          teal/azul del resto de la interfaz en vez de dejarla "pegada". */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/35 via-transparent to-accent-2/30 mix-blend-color" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      <figcaption className="absolute bottom-1 right-2">
        <a
          href={PHOTO.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-white/70 hover:text-white transition-colors"
        >
          Foto: {PHOTO.author} · {PHOTO.license} · Wikimedia Commons
        </a>
      </figcaption>
    </figure>
  );
}
