export declare class FalAiService {
    private readonly logger;
    private readonly apiKey;
    private readonly model;
    generateVideo(prompt: string, duration?: number, _numFrames?: number, aspectRatio?: '16:9' | '9:16' | '1:1'): Promise<{
        videoUrl: string;
        seed: number;
    } | null>;
    private sleep;
    private httpJson;
    downloadToFile(url: string, ext?: string): Promise<string>;
}
