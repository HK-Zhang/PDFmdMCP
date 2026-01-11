# PDF to Markdown MCP Server

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.25.2-purple.svg)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server that converts PDF pages to markdown format using the Qwen VL vision model API.

## Features

- **PDF Page Conversion**: Convert any page from a PDF document to markdown format
- **AI-Powered Extraction**: Uses Qwen VL model for accurate text and structure extraction
- **High-Resolution Rendering**: Converts PDF pages to 2x scale images for better accuracy
- **Modern MCP API**: Uses the latest `McpServer` API for clean tool registration
- **Type-Safe**: Full TypeScript support with Zod schema validation

## Installation

```bash
npm install
npm run build
```

## Configuration

The server requires two environment variables:

- `QWEN_API_URL`: The endpoint URL for the Qwen VL API (e.g., `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`)
- `QWEN_API_KEY`: Your API key for authentication

By default, the server uses the `qwen-vl-max` model.

### MCP Settings Configuration

Add this to your MCP client configuration (e.g., Claude Desktop config):

```json
{
  "mcpServers": {
    "pdf-to-markdown": {
      "command": "node",
      "args": ["/path/to/PDFmdMCP/dist/index.js"],
      "env": {
        "QWEN_API_URL": "https://your-qwen-api-endpoint.com/v1/chat/completions",
        "QWEN_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

*Note: Replace `/path/to/PDFmdMCP/dist/index.js` with the actual absolute path to the built `index.js` file on your system.*

## Available Tools

### convert_pdf_page_to_markdown

Converts a specific page from a PDF file to markdown format using AI vision analysis.

**Parameters:**
- `pdf_path` (string, required): Absolute path to the PDF file. Must exist and be readable.
- `page_number` (number, required): Page number to convert (1-indexed). Must be a positive integer between 1 and total pages.

**Returns:**
- Markdown-formatted text extracted from the PDF page

**Example:**
```
Convert page 3 of /path/to/document.pdf to markdown
```

## How It Works

1. **File Validation**: Verifies the PDF file exists and is accessible
2. **PDF Processing**: Extracts the requested page using PDF.js library
3. **Image Rendering**: Renders the PDF page as a PNG image at 2x scale for clarity
4. **AI Analysis**: Sends the base64-encoded image to Qwen VL API
5. **Markdown Extraction**: The vision model extracts text, tables, and structure
6. **Result Return**: Returns formatted markdown to the client

## Architecture

- **TypeScript 5.x**: Modern TypeScript targeting ES2022
- **MCP SDK**: Official `@modelcontextprotocol/sdk` with McpServer API
- **Zod Validation**: Type-safe schema validation for inputs
- **PDF.js**: Mozilla's robust PDF parsing library
- **Node Canvas**: Image rendering for PDF to PNG conversion

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test
```

## System Dependencies

This project uses `node-canvas`, which may require additional system libraries for pdf rendering:

- **Windows**: Should work out of the box with prebuilt binaries.
- **macOS**: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
- **Linux (Ubuntu/Debian)**: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

## Error Handling

The server provides detailed error messages for:
- Missing or invalid PDF files (`PDF file not found`)
- Invalid page numbers (outside document range)
- Invalid input parameters (non-integer page numbers, empty paths)
- API failures (connection errors, authentication, rate limits)
- Malformed API responses

All errors are returned as error content items with the `isError` flag set to true.

## Security

- Environment variable based API key management (no hardcoded secrets)
- File path validation before processing
- Input sanitization for page numbers and file paths
- Error messages don't expose sensitive details


## Requirements

- Node.js 18+
- Access to Qwen VL API endpoint
- Valid API key

## License

MIT

## Troubleshooting

**"PDF file not found"**: Ensure the path is absolute and the file exists

**"Invalid page number"**: Check that the page number is between 1 and the total pages in the PDF

**"Missing required environment variables"**: Verify `QWEN_API_URL` and `QWEN_API_KEY` are set in your MCP configuration

**"Qwen API request failed"**: Check your API key validity and endpoint URL

**Canvas context incompatibilities**: With `pdfjs-dist` v4/v5, several users report render-time failures in Node when using `node-canvas`, even with the "legacy" build. The error typically happens inside `CanvasGraphics.paintInlineImageXObject` / `paintImageXObject`. Pinning to `pdfjs-dist@4.8.69` has been confirmed as a temporary workaround and is used in this project.
