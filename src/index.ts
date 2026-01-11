#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "node:fs/promises";
import { z } from "zod";
import { convertPdfPageToImage } from "./pdfConverter.js";

interface QwenVLResponse {
  output?: {
    text?: string;
  };
  message?: string;
}

/**
 * Call Qwen VL API to convert image to markdown
 */
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

/**
 * Main server setup
 */
async function main() {
  const apiUrl = process.env.QWEN_API_URL;
  const apiKey = process.env.QWEN_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      "Missing required environment variables: QWEN_API_URL and QWEN_API_KEY must be set"
    );
  }

  const server = new McpServer({
    name: "pdf-to-markdown-mcp",
    version: "1.0.0",
  });

  // Register tool
  server.registerTool(
    "convert_pdf_page_to_markdown",
    {
      title: "Convert PDF Page to Markdown",
      description:
        "Convert a specific page from a PDF file to markdown format using Qwen VL model. The tool first converts the PDF page to an image, then uses AI vision model to extract and format the content as markdown.",
      inputSchema: {
        pdf_path: z.string().describe(
          "Absolute path to the PDF file to convert. The file must exist and be readable."
        ),
        page_number: z.number().describe(
          "Page number to convert (1-indexed). Must be between 1 and the total number of pages in the PDF."
        ),
      },
    },
    async ({ pdf_path, page_number }) => {
      try {
        // Validate inputs
        if (!pdf_path || typeof pdf_path !== "string") {
          throw new Error("pdf_path must be a non-empty string");
        }

        if (
          typeof page_number !== "number" ||
          page_number < 1 ||
          !Number.isInteger(page_number)
        ) {
          throw new Error("page_number must be a positive integer");
        }

        // Check if file exists
        try {
          await fs.access(pdf_path);
        } catch {
          throw new Error(`PDF file not found: ${pdf_path}`);
        }

        // Convert PDF page to image
        const imageBuffer = await convertPdfPageToImage(pdf_path, page_number);

        // Convert image to markdown using Qwen VL
        const markdown = await convertImageToMarkdown(
          imageBuffer,
          apiUrl,
          apiKey
        );

        return {
          content: [
            {
              type: "text",
              text: markdown,
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error converting PDF page to markdown: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("PDF to Markdown MCP server running on stdio");
}

try {
  await main();
} catch (error) {
  console.error("Fatal error:", error);
  process.exit(1);
}
