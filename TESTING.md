# PDF to Markdown Testing Guide

## Quick Test

The project includes comprehensive tests for the PDF to markdown conversion functionality.

### 1. Test PDF to Image Conversion (No API Required)

```bash
npm test
```

This will test:
- ✅ Converting PDF page to PNG image
- ✅ Handling invalid page numbers
- ✅ Handling non-existent files

### 2. Test Full PDF to Markdown Conversion (Requires API Keys)

First, set up your Qwen API credentials:

**Windows (PowerShell):**
```powershell
$env:QWEN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"
$env:QWEN_API_KEY = "your-api-key-here"
```

**Linux/Mac:**
```bash
export QWEN_API_URL="https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"
export QWEN_API_KEY="your-api-key-here"
```

Then run the full test:

```bash
npm run build
node dist/test/pdfToMarkdown.test.js
```

This will test:
- ✅ Convert PDF page to image
- ✅ Verify API credentials
- ✅ Convert image to markdown using Qwen VL API
- ✅ Save markdown output to file

### 3. Test with MCP Inspector (Requires API Keys)

You can also test the MCP server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Then use the tool `convert_pdf_page_to_markdown` with parameters:
- `pdf_path`: Absolute path to your PDF file (e.g., `C:\Users\YXZHK\source\explore\PDFmdMCP\test\test.pdf`)
- `page_number`: Page number to convert (e.g., `1`)

## Test Output Files

After running tests, check the `test/` directory for:
- `test_output.png` - The PDF page converted to PNG image
- `test_output.md` - The markdown extracted from the image
- `output_page1.png` - Output from the basic test

## Current Test Status

✅ **PDF to Image Conversion**: Working perfectly
- Successfully converts PDF pages to high-quality PNG images (2x scale)
- Properly validates page numbers and file existence
- Generated image: 6.2 MB PNG (high resolution)

⏳ **Image to Markdown Conversion**: Ready to test
- Requires QWEN_API_URL and QWEN_API_KEY environment variables
- Once credentials are set, the full pipeline will be tested

## Troubleshooting

### "QWEN_API_URL and QWEN_API_KEY environment variables not set"
Set the environment variables as shown above before running the full test.

### "PDF file not found"
Ensure you're using an absolute path to the PDF file.

### "Invalid page number"
Check that the page number is within the valid range (1 to total pages).

## What's Being Tested

1. **PDF Rendering**: Using `pdfjs-dist` to render PDF pages
2. **Image Generation**: Using `node-canvas` to create high-quality PNG images
3. **AI Vision**: Using Qwen VL model to extract text and structure
4. **Markdown Conversion**: Converting visual content to markdown format

## Performance Notes

- Image conversion is fast (< 1 second for typical pages)
- API call latency depends on image size and network (typically 2-5 seconds)
- High resolution images (2x scale) ensure better OCR accuracy
