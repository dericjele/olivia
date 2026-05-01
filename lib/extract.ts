import type { NextRequest } from "next/server";

/**
 * Extract plain text from uploaded file.
 * Supports: PDF, DOCX, TXT
 * Files are NEVER saved to disk or database — processed in memory only.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (name.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  if (name.endsWith(".pdf")) {
    return extractFromPDF(buffer);
  }

  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    return extractFromDOCX(buffer);
  }

  throw new Error(`Unsupported file type: ${name}`);
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer, {
      // Limit to 10 pages — CVs are never longer
      max: 10,
    });
    const text = data.text
      .replace(/\n{3,}/g, "\n\n") // collapse triple+ newlines
      .replace(/[ \t]{2,}/g, " ")  // collapse multiple spaces
      .trim();

    if (!text || text.length < 50) {
      throw new Error("PDF appears to be image-based or empty");
    }
    return text;
  } catch (err) {
    // If PDF parsing fails (scanned/image PDF), return a helpful message
    // that the AI can still work with
    console.error("PDF parse error:", err);
    throw new Error(
      "This PDF appears to be scanned or image-based. Please copy and paste your CV text instead."
    );
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
      throw new Error("Document appears to be empty");
    }
    return text;
  } catch (err) {
    console.error("DOCX parse error:", err);
    throw new Error(
      "Could not read this document. Please try saving as PDF or copy and paste your text."
    );
  }
}

/**
 * Parse multipart form data from a Next.js API route request.
 * Returns the file and any additional form fields.
 */
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
