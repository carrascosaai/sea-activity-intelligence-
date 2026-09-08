"use client";

import { usePathname } from "next/navigation";

/**
 * true en /widget/* — usado por Navbar/Footer/CookieConsent para
 * auto-ocultarse ahí. Deliberadamente resuelto en el cliente (usePathname)
 * y no en el layout de servidor: así el resto de la web sigue pudiendo
 * servirse estática, en vez de forzar TODA la app a renderizado dinámico
 * solo para poder leer la ruta actual en un layout compartido.
 */
export function useIsWidgetRoute(): boolean {
  const pathname = usePathname();
  return pathname?.startsWith("/widget") ?? false;
}
