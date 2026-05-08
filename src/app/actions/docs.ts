"use server";

import fs from "fs";
import path from "path";

export async function getDocContent(id: string) {
  try {
    const filePath = path.join(process.cwd(), "src/content/docs", `${id}.md`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
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
