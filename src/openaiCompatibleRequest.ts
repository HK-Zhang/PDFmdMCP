export const supportedVllmReasoningParsers = ["kimi_k2", "qwen3"] as const;

export type VllmReasoningParser =
  (typeof supportedVllmReasoningParsers)[number];

type VisionContentPart =
  | {
      type: "image_url";
      image_url: {
        url: string;
      };
    }
  | {
      type: "text";
      text: string;
    };

export interface OpenAICompatibleChatCompletionRequest {
  model: string;
  messages: Array<{
    role: "user";
    content: VisionContentPart[];
  }>;
  chat_template_kwargs?: Record<string, boolean>;
}

interface BuildOpenAICompatibleRequestOptions {
  vllmReasoningParser?: string;
}

function parseVllmReasoningParser(
  vllmReasoningParser?: string
): VllmReasoningParser | undefined {
  if (!vllmReasoningParser) {
    return undefined;
  }

  const normalizedParser = vllmReasoningParser
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (normalizedParser === "kimi_k2" || normalizedParser === "qwen3") {
    return normalizedParser;
  }

  throw new Error(
    `Unsupported VLLM_REASONING_PARSER \"${vllmReasoningParser}\". Supported values: ${supportedVllmReasoningParsers.join(", ")}.`
  );
}

function getThinkingDisabledChatTemplateKwargs(
  vllmReasoningParser?: VllmReasoningParser
): Record<string, boolean> | undefined {
  if (!vllmReasoningParser) {
    return undefined;
  }

  if (vllmReasoningParser === "kimi_k2") {
    return { thinking: false };
  }

  return { enable_thinking: false };
}

export function buildOpenAICompatibleRequest(
  imageBuffer: Buffer,
  modelName: string,
  options: BuildOpenAICompatibleRequestOptions = {}
): OpenAICompatibleChatCompletionRequest {
  const base64Image = imageBuffer.toString("base64");
  const vllmReasoningParser = parseVllmReasoningParser(
    options.vllmReasoningParser
  );
  const requestBody: OpenAICompatibleChatCompletionRequest = {
    model: modelName,
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

  const chatTemplateKwargs = getThinkingDisabledChatTemplateKwargs(
    vllmReasoningParser
  );

  if (chatTemplateKwargs) {
    requestBody.chat_template_kwargs = chatTemplateKwargs;
  }

  return requestBody;
}
