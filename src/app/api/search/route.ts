import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import MiniSearch from "minisearch";

// Cache index data in-memory to prevent reading from disk on every search request
let cachedIndex: string | null = null;
let cachedMiniSearch: MiniSearch | null = null;

function getSearchIndex(): MiniSearch | null {
  if (cachedMiniSearch) return cachedMiniSearch;

  try {
    const indexPath = path.join(process.cwd(), "public", "search-index.json");
    if (!fs.existsSync(indexPath)) {
      console.error("Search index file not found at:", indexPath);
      return null;
    }

    cachedIndex = fs.readFileSync(indexPath, "utf8");
    cachedMiniSearch = MiniSearch.loadJSON(cachedIndex, {
      fields: ["title", "body", "label"],
      storeFields: ["title", "group", "label", 'snippet', 'priority'],
      searchOptions: {
        boost: { title: 4, label: 2, body: 1 },
        fuzzy: 0.2,
        prefix: true,
      },
    });

    return cachedMiniSearch;
  } catch (error) {
    console.error("Failed to load search index on server:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const format = searchParams.get("format") || "";
  const acceptHeader = request.headers.get("accept") || "";
  const userAgent = request.headers.get("user-agent") || "";
  
  const host = request.headers.get("host") || "agentsecrets.theseventeen.co";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  const isLLM = /gptbot|gpt-bot|claude|anthropic|cohere|google-extended|commoncrawl|semrush|bot|crawler|agent/i.test(userAgent) || 
                request.headers.get("x-is-llm") === "true";

  if (!query.trim()) {
    const message = "Please specify a search query using the ?q= parameter.";
    if (format === "text" || format === "markdown" || acceptHeader.includes("text/plain") || isLLM) {
      return new NextResponse(`# AgentSecrets Documentation Search\n\n${message}`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const ms = getSearchIndex();
  if (!ms) {
    const message = "Search index is currently unavailable. Please run the build script first.";
    if (format === "text" || format === "markdown" || acceptHeader.includes("text/plain") || isLLM) {
      return new NextResponse(`# Error\n\n${message}`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const rawResults = ms.search(query.trim());

  // Deduplicate and score exactly like useDocSearch
  const seen = new Map<string, any>();
  for (const r of rawResults) {
    const sectionId = String(r.id).split("::")[0];
    const priority = (r as any).priority ?? 0.5;
    const boostedScore = r.score * (0.5 + priority);
    
    if (!seen.has(sectionId) || boostedScore > seen.get(sectionId).score) {
      const headingId = String(r.id).split("::")[1] || "";
      seen.set(sectionId, {
        id: r.id,
        url: `${baseUrl}/docs/${sectionId === "what-is-agentsecrets" ? "" : sectionId}${headingId ? '#' + headingId : ''}`,
        title: (r as any).title,
        group: (r as any).group,
        label: (r as any).title || (r as any).label,
        snippet: (r as any).snippet || "",
        score: boostedScore,
      });
    }
  }

  const results = Array.from(seen.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Return text/markdown representation if requested or requested by an LLM
  if (format === "text" || format === "markdown" || acceptHeader.includes("text/plain") || isLLM) {
    let output = `# Search Results for "${query}"\n\n`;
    if (results.length === 0) {
      output += `No documentation matches found for your query. Try searching for related keywords like "installation", "proxy", "mcp", or "encryption".\n`;
    } else {
      results.forEach((r, idx) => {
        output += `${idx + 1}. **[${r.label}](${r.url})** inside *${r.group}*\n`;
        output += `   > ${r.snippet}\n\n`;
      });
    }
    return new NextResponse(output, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  // Otherwise, return standard structured JSON
  return NextResponse.json({
    query: query.trim(),
    results: results.map(({ id, url, title, group, label, snippet, score }) => ({
      id,
      url,
      title,
      group,
      label,
      snippet,
      score,
    })),
  });
}
