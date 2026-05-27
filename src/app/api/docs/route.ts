import { NextRequest, NextResponse } from "next/server";
import { getDocContent } from "@/app/actions/docs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fullId = searchParams.get("id") || "";
  const [id, headingId] = fullId.split("::");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const doc = await getDocContent(id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  let content = doc.content;

  if (headingId) {
    const lines = content.split('\n');
    let inSection = false;
    let sectionLines: string[] = [];
    
    const generateSlug = (text: string) => text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');

    for (const line of lines) {
      const match = line.match(/^#{2,3}\s+(.*)$/);
      if (match) {
        const currentSlug = generateSlug(match[1].trim());
        if (currentSlug === headingId || headingId.startsWith(currentSlug + '-')) {
          inSection = true;
          sectionLines.push(line);
          continue;
        } else if (inSection) {
          break;
        }
      }
      if (inSection) {
        sectionLines.push(line);
      }
    }
    if (sectionLines.length > 0) {
      content = sectionLines.join('\n');
    }
  }

  // Return the raw markdown content as plain text
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
