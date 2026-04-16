// ============================================================
// services/aiService.js
// Sends cleaned resume text to Hugging Face Inference API
// and returns structured AI feedback.
// Uses the official @huggingface/inference SDK.
// ============================================================

const { HfInference } = require("@huggingface/inference");

// Models to try in order (fallback chain)
const MODELS = [
  "Qwen/Qwen2.5-Coder-32B-Instruct",
  "meta-llama/Llama-3.1-8B-Instruct",
];

// ------------------------------------------------------------
// 1. Build the system + user messages for chat completion
// ------------------------------------------------------------
function buildMessages(cleanText) {
  return [
    {
      role: "system",
      content: `You are an expert career coach and resume reviewer. 
When given a resume, analyze it and respond in EXACTLY this format with these four sections:

SUMMARY:
(2-3 sentence professional summary of the candidate)

STRENGTHS:
(List 3-5 key strengths as bullet points)

WEAKNESSES:
(List 2-3 areas that need improvement as bullet points)

SUGGESTIONS:
(List 3-5 actionable suggestions as bullet points)

Do NOT add any other sections or commentary.`,
    },
    {
      role: "user",
      content: `Please analyze this resume:\n\n${cleanText}`,
    },
  ];
}

// ------------------------------------------------------------
// 2. Main function — analyze resume via Hugging Face
// ------------------------------------------------------------
async function analyzeResume(cleanText) {
  // Guard: empty or invalid input
  if (!cleanText || typeof cleanText !== "string" || cleanText.trim().length < 20) {
    throw new Error("Resume text is too short or empty for meaningful analysis.");
  }

  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error("HF_API_KEY is not configured. Add it to your .env file.");
  }

  const hf = new HfInference(apiKey);
  const messages = buildMessages(cleanText);

  // Try each model in the fallback chain
  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`  → Trying model: ${model}`);

      const response = await hf.chatCompletion({
        model,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      });

      // Extract the assistant's reply
      const generatedText = response.choices?.[0]?.message?.content;

      if (!generatedText) {
        throw new Error("Empty response from model.");
      }

      console.log(`  ✓ Got response from ${model}`);

      // Parse into structured sections
      return parseAIResponse(generatedText);
    } catch (err) {
      console.error(`  ✗ Model ${model} failed: ${err.message}`);
      lastError = err;
    }
  }

  // All models failed
  throw lastError || new Error("All AI models failed to respond.");
}

// ------------------------------------------------------------
// 3. Parse the AI-generated text into structured sections
// ------------------------------------------------------------
function parseAIResponse(text) {
  const result = {
    summary: "",
    strengths: "",
    weaknesses: "",
    suggestions: "",
  };

  if (!text || typeof text !== "string") {
    return result;
  }

  // Define section markers (case-insensitive)
  const sectionPatterns = [
    { key: "summary", pattern: /SUMMARY\s*:/i },
    { key: "strengths", pattern: /STRENGTHS?\s*:/i },
    { key: "weaknesses", pattern: /WEAKNESSES?\s*:/i },
    { key: "suggestions", pattern: /SUGGESTIONS?\s*:/i },
  ];

  // Find the start index of each section header
  const found = [];
  for (const { key, pattern } of sectionPatterns) {
    const match = text.match(pattern);
    if (match) {
      found.push({
        key,
        headerEnd: match.index + match[0].length,
        headerStart: match.index,
      });
    }
  }

  // Sort by position in the text
  found.sort((a, b) => a.headerEnd - b.headerEnd);

  // Extract content between consecutive section markers
  for (let i = 0; i < found.length; i++) {
    const start = found[i].headerEnd;
    const end = i + 1 < found.length ? found[i + 1].headerStart : text.length;
    result[found[i].key] = text.slice(start, end).trim();
  }

  // If parsing found no sections, return the whole text as summary
  if (found.length === 0) {
    result.summary = text.trim();
  }

  return result;
}

// ============================================================
// Exports
// ============================================================
module.exports = { analyzeResume };
