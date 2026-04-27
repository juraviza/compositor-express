import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';
import { CreateLyricDto, UpdateLyricDto, ListLyricsQueryDto, GenerateLyricDto, AnalyzeLyricDto, ImproveTextDto } from './dto/lyrics.dto';
export declare class LyricsService {
    private prisma;
    private llm;
    private readonly logger;
    constructor(prisma: PrismaService, llm: LlmService);
    create(dto: CreateLyricDto): Promise<any>;
    list(q: ListLyricsQueryDto): Promise<{
        items: any;
        total: any;
        page: number;
        totalPages: number;
    }>;
    getById(id: string): Promise<any>;
    update(id: string, dto: UpdateLyricDto): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    toggleFavorite(id: string): Promise<any>;
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
    private ensureExists;
}
