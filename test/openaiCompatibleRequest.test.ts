import assert from "node:assert/strict";
import {
  buildOpenAICompatibleRequest,
  supportedVllmReasoningParsers,
} from "../src/openaiCompatibleRequest.js";

function run() {
  const sampleImage = Buffer.from("sample-image");

  const genericRequest = buildOpenAICompatibleRequest(
    sampleImage,
    "moonshotai/Kimi-K2.6-Vision-Instruct"
  );
  assert.equal(genericRequest.chat_template_kwargs, undefined);

  const kimiRequest = buildOpenAICompatibleRequest(
    sampleImage,
    "moonshotai/Kimi-K2.6-Vision-Instruct",
    { vllmReasoningParser: "kimi_k2" }
  );
  assert.deepEqual(kimiRequest.chat_template_kwargs, { thinking: false });

  const qwenRequest = buildOpenAICompatibleRequest(
    sampleImage,
    "Qwen/Qwen3-VL-235B-A22B-Instruct",
    { vllmReasoningParser: "qwen3" }
  );
  assert.deepEqual(qwenRequest.chat_template_kwargs, {
    enable_thinking: false,
  });

  assert.throws(
    () =>
      buildOpenAICompatibleRequest(sampleImage, "moonshotai/Kimi-K2.6", {
        vllmReasoningParser: "unknown-parser",
      }),
    {
      message: new RegExp(
        `Supported values: ${supportedVllmReasoningParsers.join(", ")}`
      ),
    }
  );

  console.log("✓ OpenAI-compatible request builder tests passed");
}

run();
