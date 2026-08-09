import { env } from '../../../config/env.js';
import { buildPromptBundle } from '../prompts/promptBuilder.js';

const extractJson = (text) => {
  if (!text) return null;
  const trimmed = String(text).trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const callGeminiJson = async ({ parts, temperature = 0.4 }) => {
  const apiKey = env.gemini?.apiKey;
  if (!apiKey) {
    return null;
  }

  const model = env.gemini?.model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    '';

  const parsed = extractJson(text);
  if (!parsed) {
    throw new Error('Gemini returned non-JSON content.');
  }

  return { ...parsed, provider: 'gemini' };
};

export const geminiProvider = {
  name: 'gemini',

  async generateInsights(context, options = {}) {
    const prompts = buildPromptBundle(context, options);
    return callGeminiJson({
      parts: [{ text: `${prompts.system}\n\n${prompts.user}` }],
      temperature: 0.4,
    });
  },

  /**
   * Multimodal product listing generation from a product image.
   * @param {{ mimeType: string, base64: string, hint?: string }} input
   */
  async generateProductFromImage({ mimeType, base64, hint = '' } = {}) {
    if (!base64 || !mimeType) {
      throw new Error('Image data is required for product generation.');
    }

    const prompt = `You are an e-commerce product listing assistant for marketplace sellers.
Analyze the product photo and return ONLY JSON with this exact shape:
{
  "title": "concise product title",
  "description": "2-4 sentence seller description",
  "highlights": ["short feature bullet", "..."],
  "keywords": ["keyword", "..."],
  "category": "suggested category path or name",
  "productType": "short product type",
  "attributes": { "Color": "...", "Material": "..." }
}

Rules:
- Infer only what is reasonably visible or strongly implied by the image.
- If unsure about a field, use an empty string, empty array, or omit that attribute.
- Do not invent brand names, certifications, prices, or warranty claims.
- Do not mention that you are an AI.
${hint ? `Seller hint: ${String(hint).slice(0, 200)}` : ''}`;

    return callGeminiJson({
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: String(mimeType).toLowerCase(),
            data: String(base64).replace(/^data:[^;]+;base64,/, ''),
          },
        },
      ],
      temperature: 0.35,
    });
  },
};
