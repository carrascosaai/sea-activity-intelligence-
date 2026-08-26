import type { Webcam } from "@/lib/webcams";

export function WebcamCard({ webcam }: { webcam: Webcam }) {
  const embedSrc = `https://www.youtube.com/embed/${webcam.youtubeVideoId}?autoplay=0`;

  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Cámara en directo</h3>
        <span className="text-[10px] text-muted uppercase tracking-wide">YouTube</span>
      </div>
      <div className="rounded-xl overflow-hidden aspect-video bg-black">
        <iframe
          src={embedSrc}
          title="Cámara en directo de la playa"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
      <p className="text-xs text-muted mt-2.5 leading-relaxed">
        Compara lo que ves aquí con los datos de arriba — es la forma más honesta de comprobar si se ajustan a la
        realidad ahora mismo. Fuente: {webcam.source}, no somos nosotros quienes la emitimos.
      </p>
    </div>
  );
}
