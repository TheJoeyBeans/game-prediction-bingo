import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/constants";
import { EVENTS } from "./lib/events";

// Bump when the home page's content changes; event pages use their own `updated` date
const HOME_UPDATED = "2026-10-13";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(HOME_UPDATED),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...EVENTS.map((event) => ({
      url: `${SITE_URL}/${event.slug}`,
      lastModified: new Date(event.updated),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
