export declare class KeywordExtractorService {
    private readonly logger;
    private readonly commonWords;
    private readonly emotionalWords;
    extractKeywords(lyricsText: string, title: string, randomVariation?: number): string[];
    buildSearchQueries(keywords: string[], title: string, variation?: number): string[];
}
