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

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    
    if (headingMatch) {
      // Save previous chunk
      if (currentBodyLines.length > 0 || currentHeading) {
        chunks.push({
          id: currentHeadingId ? `${sectionId}::${currentHeadingId}` : sectionId,
          title: currentHeading || pageTitle,
          group: sectionGroup,
          label: sectionLabel,
          body: stripMarkdown(currentBodyLines.join(' ')).slice(0, 2000),
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
    chunks.push({
      id: currentHeadingId ? `${sectionId}::${currentHeadingId}` : sectionId,
      title: currentHeading || pageTitle,
      group: sectionGroup,
      label: sectionLabel,
      body: stripMarkdown(currentBodyLines.join(' ')).slice(0, 2000),
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
    const chunks = extractChunks(raw, section.id, section.label, section.group);
    documents.push(...chunks);
  }

  const miniSearch = new MiniSearch<SearchDocument>({
    fields: ['title', 'body', 'label'],
    storeFields: ['title', 'group', 'label'],
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
