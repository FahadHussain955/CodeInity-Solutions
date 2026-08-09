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

export const geminiProvider = {
  name: 'gemini',

  async generateInsights(context, options = {}) {
    const apiKey = env.gemini?.apiKey;
    if (!apiKey) {
      return null;
    }

    const model = env.gemini?.model || 'gemini-2.0-flash';
    const prompts = buildPromptBundle(context, options);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${prompts.system}\n\n${prompts.user}` }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
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
  },
};
