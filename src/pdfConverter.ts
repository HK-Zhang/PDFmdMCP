// Polyfill DOM APIs required by pdfjs-dist in Node.js environment
import { createCanvas, Canvas, Image } from "canvas";
import * as fs from "node:fs/promises";

// Polyfill Canvas for pdfjs-dist
if (typeof globalThis !== "undefined") {
  (globalThis as any).Canvas = Canvas;
  (globalThis as any).Image = Image;
  // Disable OffscreenCanvas to force pdfjs-dist to use the node-canvas polyfill
  // This prevents "TypeError: Image or Canvas expected" errors when drawing
  delete (globalThis as any).OffscreenCanvas;
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

class NodeCanvasFactory {
  create(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid canvas size");
    }
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    return {
      canvas,
      context,
    };
  }

  reset(canvasAndContext: any, width: number, height: number) {
    if (!canvasAndContext.canvas) {
      throw new Error("Canvas is not specified");
    }
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid canvas size");
    }
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: any) {
    if (!canvasAndContext.canvas) {
      throw new Error("Canvas is not specified");
    }
    // Zeroing the width and height cause Firefox to release graphics
    // resources immediately, which can be important with complex documents.
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
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
    canvasFactory: new NodeCanvasFactory(),
    background: "white",
  };

  await page.render(renderContext).promise;

  return canvas.toBuffer("image/png");
}
