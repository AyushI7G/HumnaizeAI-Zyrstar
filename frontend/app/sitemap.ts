import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zyrstar.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/humanizer",
    "/detector",
    "/pricing",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/login",
    "/register",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
