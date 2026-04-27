import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { PexelsService, PexelsVideo, PexelsVideoFile } from './pexels.service';
import { PixabayService, PixabayVideo, PixabayVideoFile } from './pixabay.service';
import { KeywordExtractorService } from './keyword-extractor.service';

export interface SelectedClip {
  query: string;
  video: PexelsVideo | PixabayVideo;
  file: PexelsVideoFile | PixabayVideoFile;
  source: 'pexels' | 'pixabay';
}

// Cinematic fallback queries - emotional, beautiful footage
const CINEMATIC_FALLBACKS = [
  'sunset ocean waves drone',
  'golden hour landscape aerial',
  'rain window cinematic moody',
  'city lights night aerial',
  'forest fog morning light',
  'desert sand dunes aerial',
  'couple walking beach sunset',
  'candle flame dark room',
  'old town streets europe',
  'mountain clouds timelapse',
  'flower petals slow motion',
  'starry night sky timelapse',
];

@Injectable()
export class ClipSelectionService {
  private readonly logger = new Logger(ClipSelectionService.name);

  constructor(
    private readonly llm: LlmService,
    private readonly pexels: PexelsService,
    private readonly pixabay: PixabayService,
    private readonly keywordExtractor: KeywordExtractorService,
  ) {}

  /**
   * Use DeepSeek/LLM to analyze lyrics deeply and generate cinematic search queries
   * that are coherent with the song's emotions, imagery and narrative.
   */
  private async generateCinematicQueries(lyrics: string, title: string, count: number): Promise<string[]> {
    const systemPrompt = `You are an expert music video director and cinematographer. Your job is to READ the song lyrics carefully and create SPECIFIC video search queries that visually represent the EXACT emotions, imagery and story in the lyrics.

RULES:
- Read the lyrics word by word. Identify the KEY VISUAL IMAGES mentioned (e.g. "mar" → ocean, "lluvia" → rain, "fuego" → fire)
- Identify the DOMINANT EMOTION (love, pain, nostalgia, passion, freedom, loneliness)
- Create queries for CINEMATIC stock footage: landscapes, drone shots, nature, emotional scenes
- Each query MUST be 2-4 words in ENGLISH
- NEVER use generic words like "flamenco", "spanish", "guitar", "dancer" unless the lyrics specifically mention them
- PRIORITIZE: aerial/drone shots, landscapes, ocean, sunset/sunrise, rain, fire, city nights, nature close-ups
- Match the MOOD: sad lyrics → rain, fog, empty streets | happy lyrics → sunshine, beach, flowers | passionate → fire, sunset, storm
- Each query must be DIFFERENT - no repeated concepts
- Queries must work well on Pixabay/Pexels video search

Return ONLY valid JSON: { "queries": ["query1", "query2", ...] }`;

    const userPrompt = `Song title: "${title}"

Lyrics:
"""
${(lyrics || '').slice(0, 2000)}
"""

Analyze these lyrics carefully. What visual scenes would a professional director choose to represent this song?
Generate exactly ${count + 3} cinematic English search queries for stock footage.
Each query should evoke the SPECIFIC emotion and imagery from the lyrics, NOT generic content.
JSON only: { "queries": ["..."] }`;

    try {
      const data = await this.llm.chatJson<{ queries?: string[] }>(systemPrompt, userPrompt, 30000);
      const arr = Array.isArray(data?.queries)
        ? data!.queries!
            .map((q) => String(q || '').trim())
            .filter((q) => q.length > 0 && q.length < 60)
        : [];
      if (arr.length >= 3) {
        this.logger.log(`🎬 LLM generated ${arr.length} cinematic queries: ${arr.join(' | ')}`);
        return arr.slice(0, count + 3);
      }
    } catch (e: any) {
      this.logger.warn(`LLM cinematic query generation failed: ${e?.message}`);
    }

    // Fallback: extract keywords from lyrics and build cinematic queries
    return this.buildFallbackQueries(lyrics, title, count);
  }

  /**
   * Fallback: extract visual words from lyrics and pair with cinematic modifiers
   */
  private buildFallbackQueries(lyrics: string, title: string, count: number): string[] {
    const text = `${title} ${lyrics}`.toLowerCase();
    const visualMap: Record<string, string> = {
      'amor': 'couple sunset romantic',
      'love': 'couple sunset romantic',
      'corazón': 'heart light bokeh',
      'heart': 'heart light bokeh',
      'mar': 'ocean waves aerial drone',
      'ocean': 'ocean waves aerial drone',
      'playa': 'beach sunset golden hour',
      'beach': 'beach sunset golden hour',
      'lluvia': 'rain window cinematic',
      'rain': 'rain window cinematic',
      'fuego': 'fire flames slow motion',
      'fire': 'fire flames slow motion',
      'noche': 'city night lights aerial',
      'night': 'city night lights aerial',
      'sol': 'sunrise golden landscape',
      'sun': 'sunrise golden landscape',
      'luna': 'moonlight night sky',
      'moon': 'moonlight night sky',
      'cielo': 'sky clouds timelapse',
      'sky': 'sky clouds timelapse',
      'viento': 'wind grass field aerial',
      'wind': 'wind grass field aerial',
      'dolor': 'rain empty street moody',
      'pain': 'rain empty street moody',
      'llorar': 'rain drops window close',
      'cry': 'rain drops window close',
      'libre': 'mountain aerial freedom',
      'free': 'mountain aerial freedom',
      'camino': 'road landscape drone aerial',
      'road': 'road landscape drone aerial',
      'rosa': 'rose petals slow motion',
      'rose': 'rose petals slow motion',
      'estrella': 'stars night sky timelapse',
      'star': 'stars night sky timelapse',
      'baile': 'dance movement silhouette',
      'dance': 'dance movement silhouette',
      'alma': 'fog forest mystical light',
      'soul': 'fog forest mystical light',
      'ojos': 'eyes close up cinematic',
      'eyes': 'eyes close up cinematic',
      'silencio': 'empty room light dust',
      'silence': 'empty room light dust',
      'sueño': 'clouds sky dreamy aerial',
      'dream': 'clouds sky dreamy aerial',
      'muerte': 'dark moody fog cemetery',
      'death': 'dark moody fog cemetery',
      'vida': 'sunrise nature timelapse',
      'life': 'sunrise nature timelapse',
      'flores': 'flowers field spring aerial',
      'flowers': 'flowers field spring aerial',
      'río': 'river aerial drone nature',
      'river': 'river aerial drone nature',
      'montaña': 'mountain peak clouds drone',
      'mountain': 'mountain peak clouds drone',
      'pena': 'lonely bench rain moody',
      'sorrow': 'lonely bench rain moody',
      'beso': 'couple kiss silhouette sunset',
      'kiss': 'couple kiss silhouette sunset',
      'manos': 'hands touching close up',
      'hands': 'hands touching close up',
    };

    const queries: string[] = [];
    for (const [keyword, query] of Object.entries(visualMap)) {
      if (text.includes(keyword) && queries.length < count + 2) {
        queries.push(query);
      }
    }

    // Fill remaining with cinematic fallbacks
    while (queries.length < count + 2) {
      const fb = CINEMATIC_FALLBACKS[queries.length % CINEMATIC_FALLBACKS.length];
      if (!queries.includes(fb)) queries.push(fb);
      else break;
    }

    this.logger.log(`🎬 Fallback queries: ${queries.join(' | ')}`);
    return queries;
  }

  /** Pick clips from Pixabay + Pexels with cinematic coherence. */
  async selectClips(lyrics: string, count: number, canvasWidth: number, canvasHeight: number, variation = 0): Promise<SelectedClip[]> {
    const queries = await this.generateCinematicQueries(lyrics, '', count);
    const orientation: 'portrait' | 'landscape' = canvasHeight > canvasWidth ? 'portrait' : 'landscape';
    const used = new Set<string | number>();
    const out: SelectedClip[] = [];

    this.logger.log(`🔍 Searching ${queries.length} cinematic queries for ${count} clips...`);

    // Try each query on Pixabay first, then Pexels
    for (let i = 0; i < queries.length && out.length < count; i++) {
      const q = queries[i];
      const page = Math.max(1, (variation % 3) + 1);

      // Try Pixabay
      const pxResults = await this.pixabay
        .search(q, {
          lang: 'en',
          perPage: 15,
          page,
          order: variation % 2 === 0 ? 'popular' : 'latest',
        })
        .catch((): PixabayVideo[] => []);

      // Filter: minimum 6s duration, skip already used
      const pxCandidate = pxResults.find((v) => v.duration >= 6 && !used.has(`px-${v.id}`));
      if (pxCandidate) {
        const file = this.pixabay.pickBestFile(pxCandidate, canvasWidth, canvasHeight);
        if (file) {
          used.add(`px-${pxCandidate.id}`);
          out.push({ query: q, video: pxCandidate, file, source: 'pixabay' });
          this.logger.log(`✅ [${out.length}/${count}] Pixabay: "${q}" → id:${pxCandidate.id} (${pxCandidate.duration}s)`);
          continue;
        }
      }

      // Try Pexels if Pixabay didn't have results
      const peResults = await this.pexels
        .search(q, { orientation, perPage: 10 })
        .catch((): PexelsVideo[] => []);

      const peCandidate = peResults.find((v) => v.duration >= 6 && !used.has(`pe-${v.id}`));
      if (peCandidate) {
        const file = this.pexels.pickBestFile(peCandidate, canvasWidth, canvasHeight);
        if (file) {
          used.add(`pe-${peCandidate.id}`);
          out.push({ query: q, video: peCandidate, file, source: 'pexels' });
          this.logger.log(`✅ [${out.length}/${count}] Pexels: "${q}" → id:${peCandidate.id} (${peCandidate.duration}s)`);
          continue;
        }
      }

      this.logger.warn(`⚠️ No results for: "${q}"`);
    }

    // If still not enough, use cinematic fallbacks
    if (out.length < count) {
      this.logger.log(`📦 Need ${count - out.length} more clips, using cinematic fallbacks...`);
      for (const q of CINEMATIC_FALLBACKS) {
        if (out.length >= count) break;
        const results = await this.pixabay
          .search(q, { lang: 'en', perPage: 10, order: 'popular' })
          .catch((): PixabayVideo[] => []);
        const candidate = results.find((v) => v.duration >= 6 && !used.has(`px-${v.id}`));
        if (!candidate) continue;
        const file = this.pixabay.pickBestFile(candidate, canvasWidth, canvasHeight);
        if (!file) continue;
        used.add(`px-${candidate.id}`);
        out.push({ query: q, video: candidate, file, source: 'pixabay' });
        this.logger.log(`✅ [${out.length}/${count}] Fallback: "${q}" → id:${candidate.id}`);
      }
    }

    this.logger.log(`🎬 Final clip selection: ${out.length}/${count} clips`);
    return out;
  }
}
