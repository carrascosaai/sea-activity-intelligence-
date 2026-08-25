import type { MetadataRoute } from "next";
import { SEO_ACTIVITIES, TOP_MUNICIPALITIES_FOR_SITEMAP } from "@/lib/municipalities";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/cerca-de-mi`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/hoy`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/mapa`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/privacidad`, changeFrequency: "monthly", priority: 0.2 },
  ];

  const activityCityRoutes: MetadataRoute.Sitemap = TOP_MUNICIPALITIES_FOR_SITEMAP.flatMap((m) =>
    SEO_ACTIVITIES.map((activity) => ({
      url: `${siteUrl}/${activity}/${m.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.6,
    }))
  );

  return [...staticRoutes, ...activityCityRoutes];
}
