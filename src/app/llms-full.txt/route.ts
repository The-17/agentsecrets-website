import { NextResponse } from "next/server";
import { DOCS_SECTIONS } from "@/lib/docs-sections";
import { getDocContent } from "@/app/actions/docs";

export async function GET() {
  let output = `# AgentSecrets - Full Documentation Consolidation\n\n`;
  output += `This file contains the complete documentation suite for AgentSecrets, consolidated for ingestion by LLMs and autonomous agents.\n\n`;
  output += `---\n\n`;

  for (const s of DOCS_SECTIONS) {
    const doc = await getDocContent(s.id);
    if (doc) {
      output += `# DOCUMENT: ${s.label} (ID: ${s.id})\n\n`;
      // Strip any frontmatter or style tags if they exist to keep it super clean for LLMs
      let cleanContent = doc.content.replace(/<style>[\s\S]*?<\/style>/g, "");
      output += cleanContent.trim();
      output += `\n\n---\n\n`;
    }
  }

  return new NextResponse(output, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
