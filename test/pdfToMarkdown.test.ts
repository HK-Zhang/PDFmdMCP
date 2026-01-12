import { convertPdfPageToImage } from "../src/pdfConverter.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

interface QwenVLResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  output?: {
    text?: string;
  };
  message?: string;
}

/**
 * Convert image to markdown using Qwen VL API
 */
async function convertImageToMarkdown(
  imageBuffer: Buffer,
  apiUrl: string,
  apiKey: string
): Promise<string> {
  const base64Image = imageBuffer.toString("base64");

  const requestBody = {
    model: "Qwen3-VL-235B-A22B-Instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}`,
            },
          },
          {
            type: "text",
            text: "Please convert this image to markdown format. Extract all text, tables, and structure accurately.",
          },
        ],
      },
    ],
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
      `API request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const result = (await response.json()) as QwenVLResponse;

  // Support both OpenAI format and Qwen format
  if (result.choices?.[0]?.message?.content) {
    return result.choices[0].message.content;
  }
  
  if (result.output?.text) {
    return result.output.text;
  }

  throw new Error(
    `Unexpected API response format: ${JSON.stringify(result)}`
  );
}

/**
 * Test PDF page to markdown conversion
 */
async function testPdfToMarkdown() {
  console.log("=== PDF to Markdown Full Test Suite ===\n");

  const testPdfPath = path.join(process.cwd(), "test", "test.pdf");
  const apiUrl = process.env.QWEN_API_URL;
  const apiKey = process.env.QWEN_API_KEY;

  // Test 1: PDF to Image conversion
  console.log("Test 1: Convert PDF page to image");
  let imageBuffer: Buffer;
  try {
    imageBuffer = await convertPdfPageToImage(testPdfPath, 1);
    
    if (!Buffer.isBuffer(imageBuffer)) {
      throw new Error("Expected Buffer but got: " + typeof imageBuffer);
    }
    
    if (imageBuffer.length === 0) {
      throw new Error("Image buffer is empty");
    }
    
    // Verify PNG signature
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const actualSignature = imageBuffer.slice(0, 8);
    
    if (!actualSignature.equals(pngSignature)) {
      throw new Error("Generated buffer is not a valid PNG image");
    }
    
    console.log("✓ Test 1 passed: Successfully converted PDF page to PNG image");
    console.log(`  Image size: ${imageBuffer.length} bytes`);
    
    // Save the test image
    const outputImagePath = path.join(process.cwd(), "test", "test_output.png");
    await fs.writeFile(outputImagePath, imageBuffer);
    console.log(`  Test image saved to: ${outputImagePath}`);
  } catch (error) {
    console.error("✗ Test 1 failed:", error);
    throw error;
  }

  // Test 2: Check API credentials
  console.log("\nTest 2: Verify API credentials");
  if (!apiUrl || !apiKey) {
    console.log("⚠ Test 2 skipped: QWEN_API_URL and QWEN_API_KEY environment variables not set");
    console.log("\nTo test full PDF to markdown conversion, set environment variables:");
    console.log("  Windows (PowerShell):");
    console.log('    $env:QWEN_API_URL = "http://osl4420:13000/v1/chat/completions"');
    console.log('    $env:QWEN_API_KEY = "sk-*****"');
    console.log("\n  Linux/Mac:");
    console.log('    export QWEN_API_URL="https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"');
    console.log('    export QWEN_API_KEY="your-api-key-here"');
    return;
  }
  
  console.log("✓ Test 2 passed: API credentials found");

  // Test 3: Full conversion - Image to Markdown
  console.log("\nTest 3: Convert image to markdown using Qwen VL API");
  try {
    console.log("  Sending request to Qwen VL API...");
    const markdown = await convertImageToMarkdown(imageBuffer, apiUrl, apiKey);
    
    if (!markdown || typeof markdown !== "string") {
      throw new Error("Expected markdown string but got: " + typeof markdown);
    }
    
    if (markdown.length === 0) {
      throw new Error("Markdown content is empty");
    }
    
    console.log("✓ Test 3 passed: Successfully converted image to markdown");
    console.log(`  Markdown length: ${markdown.length} characters`);
    console.log("\n--- Markdown Content Preview ---");
    console.log(markdown.substring(0, 500) + (markdown.length > 500 ? "..." : ""));
    console.log("--- End Preview ---\n");
    
    // Save markdown output
    const outputMarkdownPath = path.join(process.cwd(), "test", "test_output.md");
    await fs.writeFile(outputMarkdownPath, markdown, "utf-8");
    console.log(`  Markdown saved to: ${outputMarkdownPath}`);
  } catch (error) {
    console.error("✗ Test 3 failed:", error);
    throw error;
  }

  console.log("\n✅ All tests passed!");
  console.log("\nSummary:");
  console.log("  - PDF page successfully converted to image");
  console.log("  - Image successfully converted to markdown using Qwen VL");
  console.log("  - Output files saved in test/ directory");
}

// Run tests
testPdfToMarkdown().catch((error) => {
  console.error("\n❌ Test suite failed:", error);
  process.exit(1);
});
