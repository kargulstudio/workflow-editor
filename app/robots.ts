import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

const CANONICAL_HOST = new URL(SITE_URL).host;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");

  if (host !== CANONICAL_HOST) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
