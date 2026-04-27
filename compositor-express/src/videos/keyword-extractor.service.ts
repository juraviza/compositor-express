import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class KeywordExtractorService {
  private readonly logger = new Logger(KeywordExtractorService.name);

  private readonly commonWords = new Set([
    // English
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'this', 'that', 'these', 'those',
    // Spanish
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'de', 'a', 'en', 'y', 'o', 'pero', 'con', 'por', 'para',
    'es', 'está', 'son', 'están', 'era', 'fueron', 'siendo', 'ser',
    'he', 'ha', 'han', 'haya', 'hayas', 'hayamos', 'hayáis', 'hayan',
    'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas',
    'mi', 'mi', 'tu', 'su', 'nuestro', 'vuestro',
    'este', 'ese', 'aquel',
    'que', 'cual', 'quien', 'donde', 'cuando', 'como', 'cuanto',
  ]);

  private readonly emotionalWords = [
    // Love, romance, passion
    'amor', 'te amo', 'amarte', 'eres mía', 'corazón', 'amor mío',
    'love', 'lover', 'beloved', 'heart', 'romance',
    // Sadness, pain
    'dolor', 'sufro', 'llorar', 'pena', 'tristeza',
    'pain', 'suffer', 'cry', 'tears', 'broken',
    // Joy, celebration
    'alegría', 'fiesta', 'baile', 'celebra',
    'joy', 'party', 'dance', 'celebrate',
    // Passion, intensity
    'fuego', 'llamas', 'pasión', 'intenso',
    'fire', 'flames', 'passion', 'intense',
  ];

  /**
   * Extract meaningful keywords from lyrics text.
   * Returns main themes and important nouns for video search.
   */
  extractKeywords(lyricsText: string, title: string, randomVariation = 0): string[] {
    const text = `${title} ${lyricsText}`.toLowerCase();
    const words = text
      .split(/[\s\-.,;:!?\/()\[\]{}"']+/)
      .filter((w) => w.length > 2 && !this.commonWords.has(w));

    // Count word frequency
    const freq = new Map<string, number>();
    words.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));

    // Score words by frequency + emotional weight
    const scored = Array.from(freq.entries()).map(([word, count]) => {
      let score = count;
      // Boost emotional words
      if (this.emotionalWords.some((ew) => word.includes(ew) || ew.includes(word))) {
        score *= 2;
      }
      // Boost title words
      if (title.toLowerCase().includes(word)) {
        score *= 3;
      }
      return { word, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Pick top keywords
    let keywords = scored.slice(0, 5).map((s) => s.word);

    // Apply random variation: skip nth keyword on regeneration for diversity
    if (randomVariation > 0 && keywords.length > 0) {
      const skipIdx = randomVariation % keywords.length;
      keywords = keywords.filter((_, i) => i !== skipIdx);
    }

    return keywords.filter((k) => k.length > 0);
  }

  /**
   * Build search queries with variations for different pages/attempts.
   * Returns multiple queries to try for diversity.
   */
  buildSearchQueries(keywords: string[], title: string, variation = 0): string[] {
    const queries: string[] = [];

    // Query 1: Title + main keywords
    if (keywords.length > 0) {
      queries.push(`${title} ${keywords[0]}`);
    } else {
      queries.push(title);
    }

    // Query 2: Different keyword combination
    if (keywords.length > 1) {
      queries.push(`${keywords[0]} ${keywords[1]}`);
    }

    // Query 3: Theme-based (if variation is used)
    if (variation > 0 && keywords.length > 0) {
      queries.push(keywords[Math.min(variation, keywords.length - 1)]);
    }

    // Query 4: Title alone for fallback
    queries.push(title);

    return queries.filter((q) => q.length > 0);
  }
}
