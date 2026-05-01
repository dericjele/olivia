import type { NextRequest } from "next/server";

/**
 * Extract plain text from uploaded CV file.
 * Files are NEVER saved to disk or database — processed in memory only.
 * Supports: PDF, DOCX, TXT
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (name.endsWith(".txt")) {
    return buffer.toString("utf-8").trim();
  }

  if (name.endsWith(".pdf")) {
    return extractFromPDF(buffer);
  }

  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    return extractFromDOCX(buffer);
  }

  throw new Error(`Unsupported file type. Please upload PDF, DOCX, or TXT.`);
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer, { max: 10 });
    const text = data.text
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();

    if (!text || text.length < 50) {
      throw new Error("PDF appears to be image-based. Please paste your CV text instead.");
    }
    return text;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Could not read PDF";
    if (msg.includes("image-based") || msg.includes("paste")) throw new Error(msg);
    throw new Error("Could not read this PDF. Please paste your CV text instead.");
  }
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();

    if (!text || text.length < 50) {
      throw new Error("Document appears to be empty.");
    }
    return text;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("empty")) throw new Error(msg);
    throw new Error("Could not read this document. Please try saving as PDF or paste your text.");
  }
}

export async function parseFormFile(
  req: NextRequest
): Promise<{ file: File | null; text: string | null }> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    return { file, text };
  }

  if (contentType.includes("application/json")) {
    const body = await req.json();
    return { file: null, text: body.text || null };
  }

  return { file: null, text: null };
}
