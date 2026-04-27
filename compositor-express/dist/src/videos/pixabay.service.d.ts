export interface PixabayVideoFile {
    url: string;
    width: number;
    height: number;
    size: number;
    thumbnail: string;
}
export interface PixabayVideoFiles {
    large?: PixabayVideoFile;
    medium?: PixabayVideoFile;
    small?: PixabayVideoFile;
    tiny?: PixabayVideoFile;
}
export interface PixabayVideo {
    id: number;
    pageURL: string;
    type: string;
    tags: string;
    duration: number;
    videos: PixabayVideoFiles;
    views: number;
    downloads: number;
    likes: number;
    comments: number;
    user_id: number;
    user: string;
    userImageURL: string;
}
export declare class PixabayService {
    private readonly logger;
    private readonly apiKey;
    search(query: string, opts?: {
        lang?: string;
        videoType?: 'all' | 'film' | 'animation';
        category?: string;
        minWidth?: number;
        minHeight?: number;
        order?: 'popular' | 'latest';
        perPage?: number;
        page?: number;
    }): Promise<PixabayVideo[]>;
    pickBestFile(video: PixabayVideo, targetWidth: number, targetHeight: number): PixabayVideoFile | null;
    downloadToFile(url: string, ext?: string): Promise<string>;
}
