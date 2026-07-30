import type { MetadataRoute } from "next";
import { stylistProfiles } from "../lib/stylists";

const base = "https://hutch-salon.mhutchi2517.chatgpt.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date();
  return [
    { url: base, lastModified: updated, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/services`, lastModified: updated, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/booking`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    ...stylistProfiles.map(({ slug }) => ({
      url: `${base}/stylists/${slug}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
