export interface PexelsVideoFile {
    id: number;
    quality: string | null;
    width: number;
    height: number;
    link: string;
}
export interface PexelsVideo {
    id: number;
    width: number;
    height: number;
    duration: number;
    url: string;
    video_files: PexelsVideoFile[];
}
export declare class PexelsService {
    private readonly logger;
    private readonly apiKey;
    search(query: string, opts?: {
        orientation?: 'portrait' | 'landscape';
        perPage?: number;
        size?: 'small' | 'medium' | 'large';
    }): Promise<PexelsVideo[]>;
    pickBestFile(video: PexelsVideo, targetWidth: number, targetHeight: number): PexelsVideoFile | null;
    downloadToFile(url: string, ext?: string): Promise<string>;
}
