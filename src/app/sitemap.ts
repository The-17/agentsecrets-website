import { MetadataRoute } from "next";
import { DOCS_SECTIONS } from "@/lib/docs-sections";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get("host") || "agentsecrets.theseventeen.co";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
  ];

  const docsRoutes = DOCS_SECTIONS.map((section) => ({
    url: `${baseUrl}/docs/${section.id === "what-is-agentsecrets" ? "" : section.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...docsRoutes];
}
