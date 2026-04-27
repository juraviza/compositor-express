import { Injectable, Logger } from '@nestjs/common';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class DeepSeekService {
  private readonly logger = new Logger(DeepSeekService.name);
  private readonly apiKey = process.env.DEEPSEEK_API_KEY || '';
  private readonly apiUrl = 'https://api.deepseek.com/chat/completions';

  /**
   * Generate professional flamenco song lyrics using DeepSeek Chat.
   */
  async generateSongLyrics(
    title: string,
    theme: string,
    style: string = 'flamenco',
    language: string = 'spanish',
  ): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY missing');
      return null;
    }

    try {
      const systemPrompt = `You are an ELITE flamenco lyricist with deep knowledge of Spanish poetry, duende, and authentic flamenco traditions. 
You create PROFESSIONAL, EMOTIONALLY RICH lyrics that:
- Use authentic Spanish flamenco vocabulary and poetic devices
- Capture genuine "duende" (emotional intensity and depth)
- Include metaphors of fire, water, love, pain, nature, and passion
- Flow naturally when sung with traditional flamenco rhythm
- Are 3-4 verses with chorus structure (16-32 lines total)
- Sound like they were written by a professional Spanish songwriter
- Avoid clichés and cheap emotions

Always respond ONLY with the lyrics, no explanations or metadata.`;

      const userPrompt = `Create PROFESSIONAL flamenco song lyrics in ${language}:
Title: "${title}"
Theme: ${theme}
Style: ${style}

Requirements:
- 3-4 verses + 1-2 choruses
- Raw emotional intensity
- Authentic Spanish flamenco language
- Poetic metaphors aligned with the theme
- Natural rhythm for singing

Return ONLY the lyrics with verse/chorus labels.`;

      this.logger.log(`🎵 Generating lyrics with DeepSeek: "${title}" - Theme: ${theme}`);

      const response = await this.callDeepSeekApi(
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        60000,
      );

      if (response?.choices?.[0]?.message?.content) {
        const lyrics = response.choices[0].message.content.trim();
        this.logger.log(`✅ Generated lyrics (${lyrics.length} characters)`);
        return lyrics;
      }

      this.logger.warn('DeepSeek returned no lyrics');
      return null;
    } catch (e: any) {
      this.logger.error(`❌ DeepSeek lyrics generation failed: ${e?.message}`);
      return null;
    }
  }

  /**
   * Generate professional cinematic video prompts based on song lyrics.
   * DeepSeek acts as an expert screenwriter creating scene-by-scene prompts
   * for Fal.ai video generation that match the EXACT meaning of the lyrics.
   */
  async generateCinematicPromptsFromLyrics(
    title: string,
    lyrics: string,
    artistName: string = 'Juan Rafael',
    numScenes: number = 5,
  ): Promise<{
    emotion: string;
    visualStyle: string;
    musicSentiment: string;
    prompts: string[];
    sceneNarrative: string;
  } | null> {
    if (!this.apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY missing');
      return null;
    }

    try {
      const systemPrompt = `You are an ELITE Hollywood screenwriter and cinematographer specializing in flamenco music videos. Your job is to read Spanish flamenco lyrics and create a CINEMATIC SCENE-BY-SCENE NARRATIVE that visualizes EXACTLY what the lyrics describe.

CRITICAL RULES:
1. Every scene MUST directly visualize a specific verse, line, or metaphor from the lyrics — NOT generic flamenco imagery
2. Read the lyrics carefully and identify the LITERAL story, characters, places, objects, emotions
3. If lyrics mention "noche" → scene shows night. If "rosas" → roses appear. If "lágrimas" → tears visible. If "guitarra" → guitar shown
4. Build a coherent visual narrative that follows the lyrics' progression
5. Each prompt is for AI video generation (Fal.ai) — must describe MOVEMENT, ACTIONS, VISUAL ELEMENTS
6. Use professional cinematography terms (close-up, tracking shot, shallow DOF, color grade, slow motion, rack focus)
7. Include specific Spanish/Andalusian visual details when relevant (flamenco dancer, guitar, stone patios, candles, mantillas, etc.)
8. Each prompt: 1-2 sentences, dense, visual, action-focused
9. Maintain emotional consistency with the song's tone

Output ONLY valid JSON with this structure:
{
  "emotion": "primary emotion in 1-3 words",
  "visualStyle": "cinematography style description",
  "musicSentiment": "musical mood description",
  "sceneNarrative": "brief overall visual narrative arc (2-3 sentences)",
  "prompts": ["scene 1 prompt", "scene 2 prompt", "scene 3 prompt", "scene 4 prompt", "scene 5 prompt"]
}`;

      const userPrompt = `Title: "${title}"
Artist: ${artistName}

LYRICS (read carefully and visualize literally):
"""
${(lyrics || '').slice(0, 2000)}
"""

Create ${numScenes} CINEMATIC VIDEO PROMPTS that VISUALIZE THESE LYRICS LITERALLY.

For each scene:
- Pick a specific verse, line, or moment from the lyrics
- Visualize what it LITERALLY says (objects, places, characters, actions, emotions)
- Add cinematic camera work and lighting
- Make it 4-10 seconds of cinema

Example: If a verse says "lloraba bajo la luna en mi balcón" → Scene shows a woman crying on a moonlit balcony with cinematic blue moonlight and shallow focus on her tears.

Return ONLY the JSON object. The prompts MUST follow the lyrics' story.`;

      this.logger.log(`🎬 DeepSeek generating cinematic prompts from lyrics for "${title}"...`);

      const response = await this.callDeepSeekApi(
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        90000,
        0.8, // Slightly higher creativity for visual storytelling
      );

      if (response?.choices?.[0]?.message?.content) {
        const content = response.choices[0].message.content.trim();
        // Extract JSON from response (may be wrapped in markdown)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed?.prompts && Array.isArray(parsed.prompts) && parsed.prompts.length >= 2) {
              this.logger.log(`✅ DeepSeek generated ${parsed.prompts.length} cinematic prompts`);
              this.logger.log(`📖 Narrative: ${parsed.sceneNarrative?.slice(0, 100)}...`);
              return parsed;
            }
          } catch (e: any) {
            this.logger.warn(`Failed to parse DeepSeek JSON: ${e?.message}`);
          }
        }
      }

      this.logger.warn('DeepSeek returned invalid prompts');
      return null;
    } catch (e: any) {
      this.logger.error(`❌ DeepSeek cinematic prompts failed: ${e?.message}`);
      return null;
    }
  }

  /**
   * Improve existing lyrics using DeepSeek.
   */
  async improveLyrics(
    originalLyrics: string,
    improvements: string,
  ): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY missing');
      return null;
    }

    try {
      const systemPrompt = `You are an expert flamenco lyricist. Improve provided lyrics while maintaining:
- Original theme and emotional core
- Authentic Spanish flamenco language
- Professional poetic quality
- Natural singing flow

Always respond ONLY with the improved lyrics, no explanations.`;

      const userPrompt = `Improve these flamenco lyrics:

Original:
"""${originalLyrics}"""

Improvements to apply:
${improvements}

Return the improved version with the same structure but enhanced quality, emotion, and authenticity.`;

      this.logger.log(`🎵 Improving lyrics with DeepSeek...`);

      const response = await this.callDeepSeekApi(
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        60000,
      );

      if (response?.choices?.[0]?.message?.content) {
        const improvedLyrics = response.choices[0].message.content.trim();
        this.logger.log(`✅ Improved lyrics`);
        return improvedLyrics;
      }

      this.logger.warn('DeepSeek returned no improved lyrics');
      return null;
    } catch (e: any) {
      this.logger.error(`❌ DeepSeek improvement failed: ${e?.message}`);
      return null;
    }
  }

  /**
   * Call DeepSeek API.
   */
  private async callDeepSeekApi(
    messages: DeepSeekMessage[],
    timeoutMs: number = 60000,
    temperature: number = 0.7,
  ): Promise<DeepSeekResponse | null> {
    return new Promise((resolve) => {
      const body = JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature,
        top_p: 0.95,
        max_tokens: 2500,
        stream: false,
      });

      const options = {
        hostname: 'api.deepseek.com',
        port: 443,
        path: '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          Authorization: `Bearer ${this.apiKey}`,
        },
      };

      const https = require('https');
      const req = https.request(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data) as DeepSeekResponse;
            resolve(parsed);
          } catch (e: any) {
            this.logger.warn(`DeepSeek parse error: ${e?.message}`);
            resolve(null);
          }
        });
      });

      req.on('error', (e: any) => {
        this.logger.warn(`DeepSeek request error: ${e?.message}`);
        resolve(null);
      });

      req.setTimeout(timeoutMs, () => {
        req.destroy();
        resolve(null);
      });

      req.write(body);
      req.end();
    });
  }
}
