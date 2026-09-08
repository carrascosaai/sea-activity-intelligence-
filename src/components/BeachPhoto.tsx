interface BeachPhotoData {
  thumbUrl: string;
  width: number;
  height: number;
  author: string;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
}

/**
 * Foto real de la playa (Wikimedia Commons, ver scripts/generate-beach-photos.mjs)
 * — nunca una foto de stock genérica ni generada por IA, y solo cuando hay
 * una coincidencia razonablemente segura por nombre. La atribución (autor +
 * licencia + enlace a la fuente) es obligatoria en casi todas las licencias
 * Commons — nunca se quita, por poco que estorbe visualmente.
 */
export function BeachPhoto({ photo, alt }: { photo: BeachPhotoData; alt: string }) {
  return (
    <figure className="-mx-5 -mt-8 mb-2 overflow-hidden relative">
      {/* eslint-disable-next-line @next/next/no-img-element -- fuente externa (Wikimedia), fuera del dominio propio */}
      <img src={photo.thumbUrl} alt={alt} width={photo.width} height={photo.height} className="w-full h-44 object-cover" />
      <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-1.5 text-right">
        <a
          href={photo.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-white/80 hover:text-white transition-colors"
        >
          Foto: {photo.author} · {photo.license} · Wikimedia Commons
        </a>
      </figcaption>
    </figure>
  );
}
