import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  async chatJson<T = any>(systemPrompt: string, userPrompt: string, timeoutMs = 60000): Promise<T> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY not configured');
    }

    // Groq requires "json" to be mentioned in messages when using response_format
    const systemWithJson = systemPrompt.includes('json')
      ? systemPrompt
      : systemPrompt + '\n\nAlways respond with valid JSON.';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemWithJson },
            { role: 'user', content: userPrompt },
          ],
          // Let the prompt handle JSON formatting, Groq is good at following instructions
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const errBody = await response.text();
        this.logger.error(`Groq request failed (${response.status}): ${errBody}`);
        throw new InternalServerErrorException(`Groq request failed: ${response.status}`);
      }
      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        this.logger.error(`Groq returned empty content: ${JSON.stringify(data)}`);
        throw new InternalServerErrorException('Groq returned empty content');
      }
      try {
        return JSON.parse(content) as T;
      } catch (e) {
        this.logger.error(`Failed to parse Groq JSON: ${content}`);
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try { return JSON.parse(match[0]) as T; } catch {}
        }
        throw new InternalServerErrorException('Failed to parse LLM response as JSON');
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        this.logger.error('Groq request timed out');
        throw new InternalServerErrorException('Groq request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
