import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/booking", "/stylists/"], disallow: ["/dashboard", "/api/", "/no-access"] },
    ],
    sitemap: "https://hutch-salon.mhutchi2517.chatgpt.site/sitemap.xml",
  };
}
