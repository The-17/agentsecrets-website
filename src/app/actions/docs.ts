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
