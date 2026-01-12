// Polyfill DOM APIs required by pdfjs-dist in Node.js environment
import { createCanvas, Canvas } from "canvas";
import * as fs from "node:fs/promises";

// Polyfill Canvas for pdfjs-dist
if (typeof globalThis !== "undefined") {
  (globalThis as any).Canvas = Canvas;
}

// Lazy load pdfjs-dist
let pdfjsLib: any = null;
async function getPdfjsLib() {
  if (!pdfjsLib) {
    // @ts-ignore
    pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return pdfjsLib;
}

/**
 * Convert a PDF page to a PNG image buffer
 * 
 * Note: This implementation uses pdfjs-dist (legacy build) with node-canvas. 
 */
export async function convertPdfPageToImage(
  pdfPath: string,
  pageNumber: number
): Promise<Buffer> {
  const pdfjsLib = await getPdfjsLib();
  const pdfData = await fs.readFile(pdfPath);
  
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfData),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    // Disable standard font loading to avoid some node issues
    disableFontFace: true,
  });

  const pdfDocument = await loadingTask.promise;

  if (pageNumber < 1 || pageNumber > pdfDocument.numPages) {
    throw new Error(
      `Invalid page number. PDF has ${pdfDocument.numPages} pages.`
    );
  }

  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });

  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  // Set white background
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context as any,
    viewport: viewport,
    background: "white",
    // Explicitly disable transparency-related operations
    enableWebGL: false,
  };

  await page.render(renderContext).promise;

  return canvas.toBuffer("image/png");
}
