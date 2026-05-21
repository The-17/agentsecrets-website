import { getDocContent } from "@/app/actions/docs";
import DocsActivePage from "@/components/docs/docs-active-page";
import { DOCS_SECTIONS } from "@/lib/docs-sections";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

// 1. Generate SEO Metadata dynamically for each documentation page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const activeId = resolvedParams.slug ? resolvedParams.slug.join("/") : "what-is-agentsecrets";
  const section = DOCS_SECTIONS.find((s) => s.id === activeId);

  if (!section) {
    return {
      title: "Page Not Found — AgentSecrets Docs",
      description: "The requested documentation page could not be found."
    };
  }

  const doc = await getDocContent(activeId);
  const frontmatterTitle = doc?.metadata?.title;
  const frontmatterDescription = doc?.metadata?.description;

  const title = frontmatterTitle 
    ? `${frontmatterTitle} — AgentSecrets Docs`
    : `${section.label} — AgentSecrets Docs`;
    
  const description = frontmatterDescription || `Learn how to safely give AI agents access to APIs without exposing your secrets. Deep dive into ${section.label} in the AgentSecrets security guides.`;
  const canonicalUrl = `https://agentsecrets.theseventeen.co/docs/${activeId === "what-is-agentsecrets" ? "" : activeId}`;

  return {
    title,
    description,
    keywords: [
      "AgentSecrets",
      section.label.toLowerCase(),
      "AI agent API security",
      "secure API credentials for AI tools",
      "zero-knowledge AI proxy",
      "Claude Desktop setup guide",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// 2. Server component reads the doc content from disk at request time
export default async function DocsDynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const activeId = resolvedParams.slug ? resolvedParams.slug.join("/") : "what-is-agentsecrets";

  // Verify the section is in the canonical list
  const section = DOCS_SECTIONS.find((s) => s.id === activeId);
  if (!section) {
    notFound();
  }

  // Fetch the markdown content on the server
  const doc = await getDocContent(activeId);
  if (doc === null) {
    notFound();
  }

  return <DocsActivePage activeId={activeId} content={doc.content} />;
}
