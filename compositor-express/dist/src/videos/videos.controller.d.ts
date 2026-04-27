import { VideosService } from './videos.service';
import { AddSubtitlesDto, GenerateVideoDto, PresignAudioDto, GenerateLyricsDto } from './dto';
export declare class VideosController {
    private readonly svc;
    constructor(svc: VideosService);
    templates(): {
        items: import("./templates").Template[];
    };
    fonts(): {
        items: import("./fonts").FontDef[];
    };
    generateLyrics(dto: GenerateLyricsDto): Promise<{
        title: string;
        theme: string;
        lyrics: string;
        generatedAt: Date;
    }>;
    presign(dto: PresignAudioDto): Promise<{
        uploadUrl: string;
        cloud_storage_path: string;
    }>;
    generate(dto: GenerateVideoDto): Promise<any>;
    list(): Promise<{
        items: any[];
    }>;
    get(id: string): Promise<any>;
    addSubtitles(id: string, dto: AddSubtitlesDto): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
