import { LyricsService } from './lyrics.service';
import { AnalyzeLyricDto, CreateLyricDto, GenerateLyricDto, ImproveTextDto, ListLyricsQueryDto, UpdateLyricDto } from './dto/lyrics.dto';
export declare class LyricsController {
    private service;
    constructor(service: LyricsService);
    stats(): Promise<{
        totalLyrics: any;
        totalFavorites: any;
    }>;
    generate(dto: GenerateLyricDto): Promise<{
        title: string;
        content: string;
    }>;
    analyze(dto: AnalyzeLyricDto): Promise<{
        suggestions: any[];
    }>;
    improve(dto: ImproveTextDto): Promise<{
        alternatives: string[];
    }>;
    create(dto: CreateLyricDto): Promise<any>;
    list(q: ListLyricsQueryDto): Promise<{
        items: any;
        total: any;
        page: number;
        totalPages: number;
    }>;
    get(id: string): Promise<any>;
    patch(id: string, dto: UpdateLyricDto): Promise<any>;
    put(id: string, dto: UpdateLyricDto): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    toggleFav(id: string): Promise<any>;
}
