export declare class AudioAnalysisService {
    private readonly logger;
    private probeDuration;
    private rmsPerChunk;
    findViralSegment(filePath: string, windowSeconds?: number): Promise<{
        start: number;
        end: number;
        duration: number;
    }>;
}
