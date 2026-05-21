"use server";

import fs from "fs";
import path from "path";

export interface ParsedDoc {
  content: string;
  metadata: {
    title?: string;
    description?: string;
  };
}

function parseMarkdown(rawContent: string): ParsedDoc {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return {
      content: rawContent,
      metadata: {}
    };
  }

  const yamlStr = match[1];
  const content = match[2];
  const metadata: { title?: string; description?: string } = {};

  const lines = yamlStr.split(/\r?\n/);
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const val = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (key === 'title') metadata.title = val;
      if (key === 'description') metadata.description = val;
    }
  }

  return {
    content,
    metadata
  };
}

export async function getDocContent(id: string): Promise<ParsedDoc | null> {
  try {
    const filePath = path.join(process.cwd(), "src/content/docs", `${id}.md`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      return parseMarkdown(raw);
    }
    return null;
  } catch (error) {
    console.error("Error reading doc content:", error);
    return null;
  }
}

export async function submitFeedback(sectionId: string, reaction: string) {
  try {
    const logPath = path.join(process.cwd(), "src/content/feedback-logs.json");
    let logs = [];
    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, "utf8"));
    }
    logs.push({
      sectionId,
      reaction,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    return { success: true };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}
