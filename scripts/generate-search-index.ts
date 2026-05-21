/**
 * Build-time search index generator.
 * Reads all markdown docs, parses them by headings, and outputs a chunked MiniSearch index to public/search-index.json.
 * 
 * Run: npx tsx scripts/generate-search-index.ts
 */

import MiniSearch from 'minisearch';
import fs from 'fs';
import path from 'path';
import { DOCS_SECTIONS } from '../src/lib/docs-sections';

const DOCS_DIR = path.join(process.cwd(), 'src/content/docs');

interface SearchDocument {
  id: string; // sectionId::headingId
  title: string;
  group: string;
  label: string;
  body: string;
  snippet: string;
  priority: number; // 0-1 educational value score
}

function stripMarkdown(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' ')    // strip fenced code blocks
    .replace(/`[^`]+`/g, ' ')           // strip inline code
    .replace(/!\[.*?\]\(.*?\)/g, ' ')   // strip images
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // extract link text
    .replace(/^#{1,6}\s+/gm, '')        // strip heading markers
    .replace(/[*_~`\[\]()>|\\-]/g, ' ') // strip remaining markdown syntax
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
}

// Group importance weights — higher = more foundational/educational
const GROUP_WEIGHT: Record<string, number> = {
  'Getting Started': 1.0,
  'Core Concepts': 0.9,
  'SDK': 0.85,
  'Proxy': 0.8,
  'Environments': 0.75,
  'Integrations': 0.7,
  'Workspaces': 0.65,
  'Reference': 0.6,
};

/**
 * Compute a 0–1 priority score based on content richness.
 * Heuristics: body length, code examples, group importance, heading presence.
 */
function computePriority(rawLines: string[], group: string, isSubHeading: boolean): number {
  const raw = rawLines.join('\n');
  const bodyLen = raw.length;
  const codeBlocks = (raw.match(/```/g) || []).length / 2; // pairs
  const hasComingSoon = /coming soon/i.test(raw);

  // Content depth: 0–0.4 based on body length (caps at ~800 chars)
  const depthScore = Math.min(bodyLen / 800, 1) * 0.4;

  // Code richness: 0–0.2 (caps at 3 code blocks)
  const codeScore = Math.min(codeBlocks / 3, 1) * 0.2;

  // Group importance: 0–0.3
  const groupScore = (GROUP_WEIGHT[group] ?? 0.5) * 0.3;

  // Sub-heading penalty: page-level chunks slightly favored
  const headingPenalty = isSubHeading ? -0.05 : 0;

  // Stub penalty
  const stubPenalty = hasComingSoon ? -0.3 : 0;

  // Final: clamp 0–1
  const score = depthScore + codeScore + groupScore + headingPenalty + stubPenalty;
  return Math.max(0, Math.min(1, Math.round(score * 100) / 100));
}

function extractChunks(raw: string, sectionId: string, sectionLabel: string, sectionGroup: string): SearchDocument[] {
  const chunks: SearchDocument[] = [];
  
  // Split by headings (## or ###)
  const lines = raw.split('\n');
  let currentHeading = '';
  let currentHeadingId = '';
  let currentBodyLines: string[] = [];
  
  // First chunk is everything before the first h2/h3
  let pageTitle = sectionLabel;
  const h1Match = raw.match(/^#\s+(.+)$/m);
  if (h1Match) pageTitle = h1Match[1].trim();

  const usedIds = new Set<string>();

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.*)$/);
    
    if (headingMatch) {
      // Save previous chunk
      if (currentBodyLines.length > 0 || currentHeading) {
        const bodyText = stripMarkdown(currentBodyLines.join(' '));
        let id = currentHeadingId ? `${sectionId}::${currentHeadingId}` : sectionId;
        
        // Ensure ID uniqueness
        if (usedIds.has(id)) {
          let counter = 1;
          while (usedIds.has(`${id}-${counter}`)) {
            counter++;
          }
          id = `${id}-${counter}`;
        }
        usedIds.add(id);

        chunks.push({
          id,
          title: currentHeading || pageTitle,
          group: sectionGroup,
          label: sectionLabel,
          body: bodyText.slice(0, 2000),
          snippet: bodyText.slice(0, 120) + (bodyText.length > 120 ? '…' : ''),
          priority: computePriority(currentBodyLines, sectionGroup, !!currentHeadingId),
        });
      }
      
      // Start new chunk
      currentHeading = headingMatch[1].trim();
      currentHeadingId = generateSlug(currentHeading);
      currentBodyLines = [];
    } else {
      // Don't include # H1 in the body of sub-chunks to avoid redundancy
      if (!line.startsWith('# ')) {
        currentBodyLines.push(line);
      }
    }
  }
  
  // Last chunk
  if (currentBodyLines.length > 0 || currentHeading) {
    const bodyText = stripMarkdown(currentBodyLines.join(' '));
    let id = currentHeadingId ? `${sectionId}::${currentHeadingId}` : sectionId;
    
    // Ensure ID uniqueness
    if (usedIds.has(id)) {
      let counter = 1;
      while (usedIds.has(`${id}-${counter}`)) {
        counter++;
      }
      id = `${id}-${counter}`;
    }
    usedIds.add(id);

    chunks.push({
      id,
      title: currentHeading || pageTitle,
      group: sectionGroup,
      label: sectionLabel,
      body: bodyText.slice(0, 2000),
      snippet: bodyText.slice(0, 120) + (bodyText.length > 120 ? '…' : ''),
      priority: computePriority(currentBodyLines, sectionGroup, !!currentHeadingId),
    });
  }
  
  return chunks;
}

function main() {
  console.log('📚 Generating deep search index...');
  
  const documents: SearchDocument[] = [];
  let skipped = 0;

  for (const section of DOCS_SECTIONS) {
    const filePath = path.join(DOCS_DIR, `${section.id}.md`);
    
    if (!fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    
    // Strip frontmatter and extract title override if present
    let content = raw;
    let titleOverride = "";
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (match) {
      const yamlStr = match[1];
      content = match[2];
      const yamlLines = yamlStr.split(/\r?\n/);
      for (const line of yamlLines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const key = line.slice(0, colonIndex).trim();
          const val = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
          if (key === 'title') titleOverride = val;
        }
      }
    }

    const chunks = extractChunks(content, section.id, titleOverride || section.label, section.group);
    documents.push(...chunks);
  }

  const miniSearch = new MiniSearch<SearchDocument>({
    fields: ['title', 'body', 'label'],
    storeFields: ['title', 'group', 'label', 'snippet', 'priority'],
    searchOptions: {
      boost: { title: 4, label: 2, body: 1 },
      fuzzy: 0.2,
      prefix: true,
    },
  });

  miniSearch.addAll(documents);

  const outputPath = path.join(process.cwd(), 'public/search-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(miniSearch.toJSON()));

  const stats = fs.statSync(outputPath);
  const sizeKB = (stats.size / 1024).toFixed(1);

  console.log(`✅ Indexed ${documents.length} chunks across ${DOCS_SECTIONS.length - skipped} files`);
  console.log(`📦 Output: public/search-index.json (${sizeKB} KB)`);
}

main();
