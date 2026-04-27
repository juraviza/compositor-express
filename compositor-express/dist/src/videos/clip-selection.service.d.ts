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
export declare class ClipSelectionService {
    private readonly llm;
    private readonly pexels;
    private readonly pixabay;
    private readonly keywordExtractor;
    private readonly logger;
    constructor(llm: LlmService, pexels: PexelsService, pixabay: PixabayService, keywordExtractor: KeywordExtractorService);
    private generateCinematicQueries;
    private buildFallbackQueries;
    selectClips(lyrics: string, count: number, canvasWidth: number, canvasHeight: number, variation?: number): Promise<SelectedClip[]>;
}
