import type { NextRequest } from "next/server";

/**
 * Extract plain text from an uploaded CV file.
 * Files are NEVER saved — processed in memory only.
 * Supports: PDF, DOCX, TXT
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const bytes = await file.arrayBuffer();

  if (name.endsWith(".txt")) {
    return new TextDecoder().decode(bytes).trim();
  }
  if (name.endsWith(".pdf")) {
    return extractFromPDF(bytes);
  }
  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    return extractFromDOCX(Buffer.from(bytes));
  }

  throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
}

async function extractFromPDF(bytes: ArrayBuffer): Promise<string> {
  try {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { text } = await extractText(pdf, { mergePages: true });
    const cleaned = text
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    if (!cleaned || cleaned.length < 50) {
      throw new Error(
        "PDF appears to be image-based or scanned. Please paste your CV text instead."
      );
    }
    return cleaned;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("image-based") || msg.includes("paste")) throw err;
    throw new Error(
      "Could not read this PDF. Please paste your CV text instead."
    );
  }
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const cleaned = result.value
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    if (!cleaned || cleaned.length < 50) {
      throw new Error("Document appears to be empty.");
    }
    return cleaned;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("empty")) throw err;
    throw new Error(
      "Could not read this document. Please try saving as PDF or paste your text."
    );
  }
}

export async function parseFormFile(
  req: NextRequest
): Promise<{ file: File | null; text: string | null }> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    return {
      file: formData.get("file") as File | null,
      text: formData.get("text") as string | null,
    };
  }
  if (contentType.includes("application/json")) {
    const body = await req.json();
    return { file: null, text: body.text || null };
  }
  return { file: null, text: null };
}
