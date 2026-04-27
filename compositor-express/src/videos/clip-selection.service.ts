import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { PexelsService, PexelsVideo, PexelsVideoFile } from './pexels.service';
import { PixabayService, PixabayVideo, PixabayVideoFile } from './pixabay.service';

export interface SelectedClip {
  query: string;
  video: PexelsVideo | PixabayVideo;
  file: PexelsVideoFile | PixabayVideoFile;
  source: 'pexels' | 'pixabay';
}

// Extended visual vocabulary for flamenco + generic emotional imagery
const VISUAL_MAP: Record<string, string[]> = {
  // Love & Passion
  'amor': ['passionate couple sunset', 'red rose close up', 'candle flame dark'],
  'love': ['passionate couple sunset', 'red rose close up', 'candle flame dark'],
  'corazón': ['heart bokeh light', 'heart fire glow', 'heart rain drops'],
  'heart': ['heart bokeh light', 'heart fire glow', 'heart rain drops'],
  'beso': ['couple kiss silhouette', 'couple embrace sunset', 'kiss rain romantic'],
  'kiss': ['couple kiss silhouette', 'couple embrace sunset', 'kiss rain romantic'],
  'fuego': ['fire flames slow motion', 'candle flame dark', 'fire dance shadows'],
  'fire': ['fire flames slow motion', 'candle flame dark', 'fire dance shadows'],
  'llamas': ['fire flames dramatic', 'candle light night', 'fire warm glow'],
  'pasión': ['fire flames dramatic', 'sunset red clouds', 'passionate dance silhouette'],
  'passion': ['fire flames dramatic', 'sunset red clouds', 'passionate dance silhouette'],

  // Pain & Sorrow
  'dolor': ['rain window moody', 'empty street night rain', 'lonely bench rain'],
  'pain': ['rain window moody', 'empty street night rain', 'lonely bench rain'],
  'pena': ['rain empty street', 'foggy road lonely', 'melancholy rain city'],
  'llorar': ['rain drops window', 'tears close up cinematic', 'rain street sad'],
  'cry': ['rain drops window', 'tears close up cinematic', 'rain street sad'],
  'triste': ['foggy morning sad', 'rain empty bench', 'cloudy sky moody'],
  'sad': ['foggy morning sad', 'rain empty bench', 'cloudy sky moody'],
  'sufro': ['rain window moody', 'shadow silhouette alone', 'candle smoke dark'],

  // Ocean & Nature
  'mar': ['ocean waves dramatic', 'sea storm waves', 'beach sunset romantic'],
  'ocean': ['ocean waves dramatic', 'sea storm waves', 'beach sunset romantic'],
  'playa': ['beach sunset golden', 'waves sand romantic', 'coastal sunset aerial'],
  'beach': ['beach sunset golden', 'waves sand romantic', 'coastal sunset aerial'],
  'lluvia': ['rain window cinematic', 'rain street night', 'rain candle romantic'],
  'rain': ['rain window cinematic', 'rain street night', 'rain candle romantic'],
  'agua': ['water drops close', 'river stream peaceful', 'ocean waves calm'],
  'water': ['water drops close', 'river stream peaceful', 'ocean waves calm'],
  'río': ['river flowing peaceful', 'river stones water', 'stream calm nature'],
  'river': ['river flowing peaceful', 'river stones water', 'stream calm nature'],
  'flor': ['rose red petals', 'flower bloom close', 'petals slow motion'],
  'flower': ['rose red petals', 'flower bloom close', 'petals slow motion'],
  'flores': ['rose red petals', 'flower field colorful', 'petals falling slow'],
  'rosa': ['rose red close', 'red petals romantic', 'rose water drop'],
  'noche': ['city night lights', 'stars night sky', 'moonlight night urban'],
  'night': ['city night lights', 'stars night sky', 'moonlight night urban'],
  'luna': ['moonlight night sky', 'full moon dramatic', 'moonlit ocean'],
  'moon': ['moonlight night sky', 'full moon dramatic', 'moonlit ocean'],
  'estrella': ['stars night sky', 'starry night timelapse', 'milky way night'],
  'star': ['stars night sky', 'starry night timelapse', 'milky way night'],
  'cielo': ['sky clouds timelapse', 'dramatic sky clouds', 'clouds moving aerial'],
  'sky': ['sky clouds timelapse', 'dramatic sky clouds', 'clouds moving aerial'],
  'sol': ['sunrise golden hour', 'sunset golden landscape', 'sun rays clouds'],
  'sun': ['sunrise golden hour', 'sunset golden landscape', 'sun rays clouds'],
  'atardecer': ['sunset golden hour', 'sunset beach romantic', 'sunset city silhouette'],
  'sunset': ['sunset golden hour', 'sunset beach romantic', 'sunset city silhouette'],
  'alba': ['sunrise golden hour', 'dawn fog morning', 'sunrise landscape aerial'],

  // Freedom & Dance
  'libre': ['mountain peak aerial', 'freedom bird flying', 'open road horizon'],
  'free': ['mountain peak aerial', 'freedom bird flying', 'open road horizon'],
  'volar': ['bird flying sunset', 'drone shot aerial', 'freedom bird ocean'],
  'fly': ['bird flying sunset', 'drone shot aerial', 'freedom bird ocean'],
  'baile': ['dance silhouette dramatic', 'shadows dance dark', 'movement artistic cinematic'],
  'dance': ['dance silhouette dramatic', 'shadows dance dark', 'movement artistic cinematic'],
  'cante': ['spotlight dramatic dark', 'stage light shadow', 'silhouette dramatic'],
  'duende': ['candle smoke dark', 'spotlight dramatic dark', 'shadows artistic moody'],

  // Urban & Spanish
  'calle': ['old town streets european', 'cobblestone street night', 'spanish plaza evening'],
  'street': ['old town streets european', 'cobblestone street night', 'spanish plaza evening'],
  'ciudad': ['city night lights', 'urban sunset aerial', 'city street rain'],
  'city': ['city night lights', 'urban sunset aerial', 'city street rain'],
  'tablao': ['spotlight stage dark', 'dramatic light shadow', 'stage curtain red'],
  'tango': ['dance silhouette dramatic', 'spotlight dark moody', 'passionate dance shadows'],

  // Abstract emotions
  'alma': ['foggy forest mystical', 'light beam dark', 'mystical smoke cinematic'],
  'soul': ['foggy forest mystical', 'light beam dark', 'mystical smoke cinematic'],
  'tiempo': ['clock time close', 'sand clock grain', 'time passing dramatic'],
  'time': ['clock time close', 'sand clock grain', 'time passing dramatic'],
  'destino': ['road horizon sunset', 'path foggy mysterious', 'journey landscape aerial'],
  'destiny': ['road horizon sunset', 'path foggy mysterious', 'journey landscape aerial'],
  'recuerdo': ['vintage photo fade', 'memory blur effect', 'old street evening'],
  'memory': ['vintage photo fade', 'memory blur effect', 'old street evening'],

  // Body parts
  'ojos': ['eyes close up cinematic', 'eye tear emotional', 'eyes gaze romantic'],
  'eyes': ['eyes close up cinematic', 'eye tear emotional', 'eyes gaze romantic'],
  'manos': ['hands touching romantic', 'hands candle light', 'fingers close cinematic'],
  'hands': ['hands touching romantic', 'hands candle light', 'fingers close cinematic'],
  'cara': ['face close cinematic', 'face shadow dramatic', 'portrait moody lighting'],
  'face': ['face close cinematic', 'face shadow dramatic', 'portrait moody lighting'],

  // Common
  'sombra': ['shadow silhouette dramatic', 'shadow dance dark', 'silhouette sunset'],
  'shadow': ['shadow silhouette dramatic', 'shadow dance dark', 'silhouette sunset'],
  'luz': ['light beam dark', 'candle light glow', 'sun rays dramatic'],
  'light': ['light beam dark', 'candle light glow', 'sun rays dramatic'],
  'negro': ['dark moody cinematic', 'black smoke dark', 'night fog mysterious'],
  'dark': ['dark moody cinematic', 'black smoke dark', 'night fog mysterious'],
  'blanco': ['white dress wind', 'white rose petals', 'fog light ethereal'],
  'white': ['white dress wind', 'white rose petals', 'fog light ethereal'],
  'rojo': ['red rose dramatic', 'red silk fabric', 'fire flames dramatic'],
  'red': ['red rose dramatic', 'red silk fabric', 'fire flames dramatic'],
  'silencio': ['empty room light dust', 'silence fog moody', 'still water mirror'],
  'silence': ['empty room light dust', 'silence fog moody', 'still water mirror'],
  'querer': ['couple sunset romantic', 'hands touching warm', 'together love cinematic'],
};

// Cinematic fallbacks - only used when no keyword matches
const CINEMATIC_FALLBACKS = [
  'sunset ocean waves aerial',
  'candle flame dark moody',
  'rain window cinematic',
  'city night lights aerial',
  'foggy forest mystical',
  'beach sunset romantic',
  'fire flames dramatic',
  'moonlight night sky',
  'rose petals falling slow',
  'spotlight dramatic dark',
];

const FLAMENCO_DIRECT_IMAGERY = [
  'spanish guitar close up',
  'flamenco dancer dramatic',
  'red rose petals falling',
  'candle smoke spanish',
  'spanish plaza evening',
  'passionate dance dramatic',
];

@Injectable()
export class ClipSelectionService {
  private readonly logger = new Logger(ClipSelectionService.name);

  constructor(
    private readonly llm: LlmService,
    private readonly pexels: PexelsService,
    private readonly pixabay: PixabayService,
  ) {}

  /**
   * Extract specific visual keywords from lyrics and build targeted queries.
   */
  private buildQueriesFromLyrics(lyrics: string, title: string, count: number): string[] {
    const text = `${title} ${lyrics}`.toLowerCase();
    const queries: string[] = [];
    const usedConcepts = new Set<string>();

    // 1. Find all matching keywords and expand to multiple queries
    for (const [keyword, queryList] of Object.entries(VISUAL_MAP)) {
      if (text.includes(keyword)) {
        for (const query of queryList.slice(0, 2)) {
          if (!usedConcepts.has(query)) {
            queries.push(query);
            usedConcepts.add(query);
          }
        }
      }
    }

    // 2. If lyrics mention flamenco-specific words, add flamenco imagery
    const flamencoWords = ['flamenco', 'sevillanas', 'tablao', 'cante jondo', 'bulerías', 'tango', 'saeta', 'alegría', 'seguiriya'];
    for (const fw of flamencoWords) {
      if (text.includes(fw)) {
        for (const q of FLAMENCO_DIRECT_IMAGERY) {
          if (!usedConcepts.has(q)) {
            queries.push(q);
            usedConcepts.add(q);
          }
        }
      }
    }

    // 3. For remaining slots, add mood-based queries
    const mood = this.detectMood(text);
    const moodQueries: Record<string, string[]> = {
      sad: ['rain window moody', 'empty street night rain', 'foggy morning sad'],
      passionate: ['fire flames dramatic', 'sunset red clouds', 'passionate dance silhouette'],
      romantic: ['couple sunset romantic', 'candle light romantic', 'red rose petals'],
      dark: ['dark moody cinematic', 'candle smoke dark', 'shadow silhouette dramatic'],
      peaceful: ['river flowing peaceful', 'beach sunset golden', 'sunrise landscape aerial'],
    };
    const moodQ = moodQueries[mood] || moodQueries.peaceful;
    for (const q of moodQ) {
      if (!usedConcepts.has(q) && queries.length < count + 4) {
        queries.push(q);
        usedConcepts.add(q);
      }
    }

    const unique = [...new Set(queries)];
    return unique.slice(0, count + 4);
  }

  /**
   * Detect dominant mood from lyrics
   */
  private detectMood(text: string): 'sad' | 'passionate' | 'romantic' | 'dark' | 'peaceful' {
    const counts: Record<string, number> = { sad: 0, passionate: 0, romantic: 0, dark: 0, peaceful: 0 };

    const wordGroups: Record<string, string[]> = {
      sad: ['dolor', 'pena', 'llorar', 'sufrir', 'triste', 'ausencia', 'perder', 'abandono', 'pain', 'cry', 'sad', 'suffer', 'sorrow'],
      passionate: ['pasión', 'fuego', 'llamas', 'ardiente', 'intenso', 'passion', 'fire', 'flames', 'burn', 'ardor'],
      romantic: ['amor', 'beso', 'corazón', 'love', 'kiss', 'heart', 'carino', 'querer', 'amante'],
      dark: ['sombra', 'oscuridad', 'noche', 'negro', 'muerte', 'shadow', 'dark', 'night', 'death', 'black', 'grief'],
      peaceful: ['mar', 'playa', 'río', 'sol', 'luna', 'cielo', 'ocean', 'river', 'sky', 'peace', 'tranquilo'],
    };

    for (const [mood, words] of Object.entries(wordGroups)) {
      counts[mood] = words.filter(w => text.includes(w)).length;
    }

    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'peaceful') as 'sad' | 'passionate' | 'romantic' | 'dark' | 'peaceful';
  }

  /**
   * Use LLM to analyze lyrics and generate targeted cinematic queries.
   */
  private async generateLLMQueries(lyrics: string, title: string, count: number): Promise<string[]> {
    const systemPrompt = `You are an expert music video director for FLAMENCO SONGS. Your job is to analyze song lyrics and create EXACT video search terms that match the specific imagery in the lyrics.

CRITICAL RULES:
- The song is FLAMENCO - prioritize: candles, fire, roses, ocean, dramatic shadows, spanish/andalusian imagery
- Extract EXACT visual nouns from the lyrics (flor, mar, fuego, luna, ojos, manos, sombra, etc.)
- For EACH visual element found, create 1-2 specific search terms
- ALWAYS include "flamenco" or "spanish" in queries when lyrics are emotional/passionate
- Use format: "[main visual] [emotion/mood]"
- Examples: "candle flame dark moody", "rose petals red romantic", "ocean waves dramatic flamenco"
- NEVER use generic queries like "sunset" alone - always add context
- Maximum 4 words per query
- Return ONLY valid JSON array of strings: ["query1", "query2", ...]`;

    const userPrompt = `Song title: "${title}"

Lyrics:
${(lyrics || '').slice(0, 2500)}

Extract the main visual images from these lyrics and create cinematic search terms.
For each major visual element in the lyrics, create a specific search query.
Prioritize spanish/flamenco imagery when emotions are strong.
JSON array only: ["query1", "query2", ...]`;

    try {
      const data = await this.llm.chatJson<{ queries: string[] }>(systemPrompt, userPrompt, 30000);
      const arr = Array.isArray(data?.queries)
        ? data.queries.map((q: string) => String(q || '').trim()).filter((q: string) => q.length > 0 && q.length < 80)
        : [];

      if (arr.length >= 3) {
        this.logger.log(`🎬 LLM generated ${arr.length} queries: ${arr.slice(0, 5).join(' | ')}`);
        return arr.slice(0, count + 3);
      }
    } catch (e: any) {
      this.logger.warn(`LLM query generation failed: ${e?.message}`);
    }

    return [];
  }

  /** Main method: select clips coherent with lyrics */
  async selectClips(
    lyrics: string,
    count: number,
    canvasWidth: number,
    canvasHeight: number,
    variation = 0,
  ): Promise<SelectedClip[]> {
    const keywordQueries = this.buildQueriesFromLyrics(lyrics, '', count);
    const llmQueries = await this.generateLLMQueries(lyrics, '', count);

    const allQueries = [...keywordQueries];
    for (const q of llmQueries) {
      if (!allQueries.includes(q) && allQueries.length < count + 5) {
        allQueries.push(q);
      }
    }

    const orientation: 'portrait' | 'landscape' = canvasHeight > canvasWidth ? 'portrait' : 'landscape';
    const used = new Set<string | number>();
    const out: SelectedClip[] = [];

    this.logger.log(`🎬 Selecting ${count} clips from ${allQueries.length} queries...`);
    this.logger.log(`📝 Queries: ${allQueries.slice(0, 8).join(' | ')}`);

    for (let i = 0; i < allQueries.length && out.length < count; i++) {
      const q = allQueries[i];

      // Try Pixabay
      const pxResults = await this.pixabay
        .search(q, { lang: 'en', perPage: 15, page: 1 })
        .catch((): PixabayVideo[] => []);

      const pxCandidate = pxResults.find((v) => v.duration >= 5 && !used.has(`px-${v.id}`));
      if (pxCandidate) {
        const file = this.pixabay.pickBestFile(pxCandidate, canvasWidth, canvasHeight);
        if (file) {
          used.add(`px-${pxCandidate.id}`);
          out.push({ query: q, video: pxCandidate, file, source: 'pixabay' });
          this.logger.log(`✅ Pixabay: "${q}" → id:${pxCandidate.id} (${pxCandidate.duration}s)`);
          continue;
        }
      }

      // Try Pexels
      const peResults = await this.pexels
        .search(q, { orientation, perPage: 10 })
        .catch((): PexelsVideo[] => []);

      const peCandidate = peResults.find((v) => v.duration >= 5 && !used.has(`pe-${v.id}`));
      if (peCandidate) {
        const file = this.pexels.pickBestFile(peCandidate, canvasWidth, canvasHeight);
        if (file) {
          used.add(`pe-${peCandidate.id}`);
          out.push({ query: q, video: peCandidate, file, source: 'pexels' });
          this.logger.log(`✅ Pexels: "${q}" → id:${peCandidate.id} (${peCandidate.duration}s)`);
          continue;
        }
      }

      this.logger.warn(`⚠️ No results: "${q}"`);
    }

    this.logger.log(`🎬 Selected ${out.length}/${count} clips`);
    return out;
  }
}
