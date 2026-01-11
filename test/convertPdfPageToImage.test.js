import { convertPdfPageToImage } from "../src/index.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
/**
 * Test for convertPdfPageToImage function
 */
async function testConvertPdfPageToImage() {
    const testPdfPath = path.join(process.cwd(), "test", "DNV_Annual_Report_2024.pdf");
    console.log("Test 1: Convert valid PDF page to image");
    try {
        const imageBuffer = await convertPdfPageToImage(testPdfPath, 1);
        if (!Buffer.isBuffer(imageBuffer)) {
            throw new Error("Expected Buffer but got: " + typeof imageBuffer);
        }
        if (imageBuffer.length === 0) {
            throw new Error("Image buffer is empty");
        }
        // Verify PNG signature (first 8 bytes)
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        const actualSignature = imageBuffer.slice(0, 8);
        if (!actualSignature.equals(pngSignature)) {
            throw new Error("Generated buffer is not a valid PNG image");
        }
        console.log("✓ Test 1 passed: Successfully converted page 1 to PNG image");
        console.log(`  Image size: ${imageBuffer.length} bytes`);
        // Optional: Save test output
        const outputPath = path.join(process.cwd(), "test", "output_page1.png");
        await fs.writeFile(outputPath, imageBuffer);
        console.log(`  Test image saved to: ${outputPath}`);
    }
    catch (error) {
        console.error("✗ Test 1 failed:", error);
        throw error;
    }
    console.log("\nTest 2: Handle invalid page number");
    try {
        await convertPdfPageToImage(testPdfPath, 99999);
        console.error("✗ Test 2 failed: Should have thrown error for invalid page number");
        throw new Error("Expected error was not thrown");
    }
    catch (error) {
        if (error.message.includes("Invalid page number")) {
            console.log("✓ Test 2 passed: Correctly rejected invalid page number");
        }
        else {
            console.error("✗ Test 2 failed: Unexpected error:", error);
            throw error;
        }
    }
    console.log("\nTest 3: Handle non-existent file");
    try {
        await convertPdfPageToImage("/nonexistent/file.pdf", 1);
        console.error("✗ Test 3 failed: Should have thrown error for non-existent file");
        throw new Error("Expected error was not thrown");
    }
    catch (error) {
        if (error.code === "ENOENT" || error.message.includes("no such file")) {
            console.log("✓ Test 3 passed: Correctly rejected non-existent file");
        }
        else {
            console.error("✗ Test 3 failed: Unexpected error:", error);
            throw error;
        }
    }
    console.log("\n✅ All tests passed!");
}
// Run tests
testConvertPdfPageToImage().catch((error) => {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
});
//# sourceMappingURL=convertPdfPageToImage.test.js.map