import { NextResponse } from "next/server";
import { DOCS_SECTIONS } from "@/lib/docs-sections";

export async function GET() {
  const baseUrl = "https://agentsecrets.theseventeen.co";
  
  let output = `# AgentSecrets\n\n`;
  output += `AgentSecrets is zero-knowledge secrets management and credential infrastructure for the AI era.\n\n`;
  output += `It provides a local proxy that intercepts requests from AI agents, resolves actual API credentials from local OS Keychain, and injects them at the transport layer, ensuring the agent never sees the credentials.\n\n`;
  output += `## Key Features\n`;
  output += `- **Zero-Knowledge Sync**: E2E encrypted local key database. The cloud server cannot decrypt your keys.\n`;
  output += `- **The No get() Principle**: AI agents only hold key names. Credentials exist in-memory only during transit.\n`;
  output += `- **Transport Layer Injection**: Transparently intercepts SDK requests (like OpenAI or Stripe) to authenticate outbound queries.\n`;
  output += `- **Domain Allowlist**: Strict egress rules to prevent prompt injection credential theft.\n\n`;
  
  output += `## Search the Documentation\n`;
  output += `You can programmatically search this documentation by making a GET request to: \`${baseUrl}/api/search?q=<query>\`\n`;
  output += `Calling this endpoint with an LLM crawler or requesting text format returns search results in a clean, navigationless markdown list of relevant articles, snippets, and deep links. Use this to quickly find specific guides, troubleshooting steps, or comparison details.\n\n`;

  output += `## Documentation Map\n\n`;

  DOCS_SECTIONS.forEach((s) => {
    output += `- [${s.label}](${baseUrl}/docs/${s.id === "what-is-agentsecrets" ? "" : s.id})\n`;
  });

  output += `\nFor a single-file consolidated version of the entire documentation suite, see: ${baseUrl}/llms-full.txt\n`;

  return new NextResponse(output, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
