# PDF to Markdown MCP Server

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.25.2-purple.svg)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server that converts PDF pages to markdown format using the Qwen VL vision model.

## Features
- **Convert PDF to Markdown**: Extract text, tables, and document structure from any PDF page.
- **Vision-Powered Accuracy**: Uses AI vision (Qwen VL) for high-fidelity extraction that regular text parsers often miss.
- **Easy Integration**: Works with any MCP client like Claude Desktop.

## Requirements
- **Node.js**: Version 18 or higher.
- **Qwen VL API Access**: An API key and access to a Qwen VL endpoint.

## Installation & Configuration

### 1. Install Dependencies
```bash
npm install
npm run build
```

### 2. Environment Variables
The server needs the following environment variables:
- `QWEN_API_URL`: The endpoint URL (e.g., `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`)
- `QWEN_API_KEY`: Your authentication key.
- `QWEN_MODEL`: The specific model name (defaults to `qwen-vl-max`).

### 3. Setup with Claude Desktop
Add this to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "pdf-to-markdown": {
      "command": "npx",
      "args": [
        "-y",
        "pdf-to-markdown-mcp"
      ],
      "env": {
        "QWEN_API_URL": "https://your-qwen-api-endpoint.com/v1/chat/completions",
        "QWEN_API_KEY": "your-api-key-here",
        "QWEN_MODEL": "qwen-vl-max"
      }
    }
  }
}
```

## Usage

Once connected, you can use the `convert_pdf_page_to_markdown` tool.

### Tool: `convert_pdf_page_to_markdown`
Converts a specific page from a PDF file to markdown.

**Arguments:**
- `pdf_path` (string): Absolute path to the PDF file on your computer.
- `page_number` (number): The page number you want to convert (starting from 1).

**Example Prompt:**
> "Please convert page 5 of C:\Documents\Report.pdf to markdown for me."

## System Dependencies
Depending on your OS, you may need additional libraries for PDF rendering:

- **Windows**: No additional steps required.
- **macOS**: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
- **Linux (Ubuntu/Debian)**: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

## Troubleshooting
- **"PDF file not found"**: Ensure the path is absolute and the file is accessible.
- **"Invalid page number"**: Check that the page number exists in the document.
- **API Errors**: Verify your `QWEN_API_URL` and `QWEN_API_KEY`.
- **Render Failures**: If conversion fails on Linux/macOS, ensure the **System Dependencies** above are installed.

## License
Apache 2.0
