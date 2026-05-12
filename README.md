# PDF to Markdown MCP Server

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.27.1-purple.svg)](https://modelcontextprotocol.io/)

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
- `QWEN_MODEL`: The specific model name (defaults to `Qwen3-VL-235B-A22B-Instruct`).
- `VLLM_REASONING_PARSER` (optional): When you serve a reasoning model through vLLM and need thinking disabled, set this to `kimi_k2` for Kimi K2.x or `qwen3` for Qwen3. The server will send the matching `chat_template_kwargs` expected by vLLM.
- `WORKSPACE` (optional): Comma-separated list of absolute directory paths. When set, the server will only process PDF files located within these directories, preventing access to files outside the allowed workspace.

The runtime and test scripts automatically load a project-local `.env` file when one is present, so you can usually keep these values in `.env` instead of exporting them in your shell.

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
        "QWEN_MODEL": "Qwen3-VL-235B-A22B-Instruct"
      }
    }
  }
}
```

### vLLM reasoning models

If your OpenAI-compatible endpoint is powered by vLLM and the served model defaults to thinking mode, configure the parser so the server can disable it correctly:

- `VLLM_REASONING_PARSER=kimi_k2` sends `chat_template_kwargs: { "thinking": false }`
- `VLLM_REASONING_PARSER=qwen3` sends `chat_template_kwargs: { "enable_thinking": false }`

Example MCP configuration for Kimi K2.x through vLLM:

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
        "QWEN_API_URL": "http://your-vllm-host:8000/v1/chat/completions",
        "QWEN_API_KEY": "EMPTY",
        "QWEN_MODEL": "moonshotai/Kimi-K2.6-Vision-Instruct",
        "VLLM_REASONING_PARSER": "kimi_k2"
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
- **API Errors**: Verify your `QWEN_API_URL` and `QWEN_API_KEY` in `.env` or your shell environment.
- **Render Failures**: If conversion fails on Linux/macOS, ensure the **System Dependencies** above are installed.

## License
Apache 2.0
