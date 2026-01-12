import { convertPdfPageToImage } from "../src/pdfConverter.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * Demo: Convert a specific PDF page to markdown
 * 
 * Usage: node dist/test/demo.js [pdf-path] [page-number]
 * Example: node dist/test/demo.js test/test.pdf 1
 */

interface QwenVLResponse {
  output?: {
    text?: string;
  };
  message?: string;
}

async function convertImageToMarkdown(
  imageBuffer: Buffer,
  apiUrl: string,
  apiKey: string
): Promise<string> {
  const base64Image = imageBuffer.toString("base64");

  const requestBody = {
    model: "qwen-vl-max",
    input: {
      messages: [
        {
          role: "user",
          content: [
            {
              image: `data:image/png;base64,${base64Image}`,
            },
            {
              text: "Please convert this image to markdown format. Extract all text, tables, and structure accurately.",
            },
          ],
        },
      ],
    },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Qwen API request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const result = (await response.json()) as QwenVLResponse;

  if (result.output?.text) {
    return result.output.text;
  }

  throw new Error(
    `Unexpected API response format: ${JSON.stringify(result)}`
  );
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const pdfPath = args[0] || path.join(process.cwd(), "test", "test.pdf");
  const pageNumber = parseInt(args[1] || "1", 10);

  console.log("=== PDF to Markdown Demo ===\n");
  console.log(`PDF Path: ${pdfPath}`);
  console.log(`Page Number: ${pageNumber}\n`);

  // Check API credentials
  const apiUrl = process.env.QWEN_API_URL;
  const apiKey = process.env.QWEN_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error("❌ Error: Missing API credentials");
    console.error("\nPlease set environment variables:");
    console.error("  QWEN_API_URL - Qwen API endpoint URL");
    console.error("  QWEN_API_KEY - Your Qwen API key\n");
    console.error("Windows (PowerShell):");
    console.error('  $env:QWEN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"');
    console.error('  $env:QWEN_API_KEY = "your-api-key-here"\n');
    process.exit(1);
  }

  try {
    // Step 1: Convert PDF page to image
    console.log("Step 1: Converting PDF page to image...");
    const startTime = Date.now();
    const imageBuffer = await convertPdfPageToImage(pdfPath, pageNumber);
    const imageTime = Date.now() - startTime;
    console.log(`✓ Image generated (${imageTime}ms, ${imageBuffer.length} bytes)\n`);

    // Save intermediate image
    const imagePath = path.join(
      process.cwd(),
      "test",
      `demo_page${pageNumber}.png`
    );
    await fs.writeFile(imagePath, imageBuffer);
    console.log(`Image saved to: ${imagePath}\n`);

    // Step 2: Convert image to markdown
    console.log("Step 2: Converting image to markdown using Qwen VL...");
    const apiStartTime = Date.now();
    const markdown = await convertImageToMarkdown(imageBuffer, apiUrl, apiKey);
    const apiTime = Date.now() - apiStartTime;
    console.log(`✓ Markdown generated (${apiTime}ms, ${markdown.length} characters)\n`);

    // Save markdown
    const markdownPath = path.join(
      process.cwd(),
      "test",
      `demo_page${pageNumber}.md`
    );
    await fs.writeFile(markdownPath, markdown, "utf-8");
    console.log(`Markdown saved to: ${markdownPath}\n`);

    // Display preview
    console.log("=== Markdown Preview ===");
    console.log(markdown.substring(0, 800));
    if (markdown.length > 800) {
      console.log("\n... (truncated, see output file for full content)");
    }
    console.log("\n=== End Preview ===\n");

    console.log("✅ Conversion completed successfully!");
    console.log(`Total time: ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

main();
