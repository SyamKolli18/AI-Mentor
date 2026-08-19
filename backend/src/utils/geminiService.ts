import { env } from '../config/env';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export class GeminiService {
  private static get apiKey(): string | undefined {
    return process.env.GEMINI_API_KEY || (env as any).GEMINI_API_KEY;
  }

  private static get provider(): string {
    return process.env.AI_PROVIDER || (env as any).AI_PROVIDER || 'gemini';
  }

  public static isLLMConnected(): boolean {
    return !!(this.apiKey && this.apiKey.trim().length > 0 && this.provider === 'gemini');
  }

  /**
   * Calls Google Gemini REST API with retries, timeout, and structured JSON parsing.
   */
  public static async callGemini(
    prompt: string,
    systemInstruction?: string,
    retries = 2,
    timeoutMs = 15000
  ): Promise<string | null> {
    if (!this.isLLMConnected()) {
      console.log('ℹ️ [GEMINI SERVICE] LLM API key not present or AI_PROVIDER not set to gemini. Utilizing structured fallback engine.');
      return null;
    }

    const apiKey = this.apiKey;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt }],
      },
    ];

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any = await response.json();
        const candidates = data?.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content?.parts?.[0]?.text) {
          return candidates[0].content.parts[0].text;
        }
      } catch (err: any) {
        console.warn(`⚠️ [GEMINI SERVICE] Attempt ${attempt + 1} failed: ${err.message}`);
        if (attempt === retries) {
          console.error('❌ [GEMINI SERVICE] All Gemini API attempts exhausted. Falling back to local fallback response.');
          return null;
        }
        // Exponential backoff delay
        await new Promise((res) => setTimeout(res, 1000 * Math.pow(2, attempt)));
      }
    }

    return null;
  }

  /**
   * Generates validated structured JSON response from Gemini API or returns null on failure.
   */
  public static async generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T | null> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON without markdown codeblock wrapper or extra commentary.`;
    const textResponse = await this.callGemini(jsonPrompt, systemInstruction);

    if (!textResponse) return null;

    try {
      // Clean possible markdown ```json ... ``` wrapper
      const cleaned = textResponse
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleaned) as T;
    } catch (parseErr) {
      console.error('❌ [GEMINI SERVICE] JSON parse error from LLM response:', parseErr);
      return null;
    }
  }
}
