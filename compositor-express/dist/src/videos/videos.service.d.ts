import { PrismaService } from '../prisma/prisma.service';
import { FfmpegService } from './ffmpeg.service';
import { AudioAnalysisService } from './audio-analysis.service';
import { SceneSelectionService } from './scene-selection.service';
import { ClipSelectionService } from './clip-selection.service';
import { PexelsService } from './pexels.service';
import { PixabayService } from './pixabay.service';
import { FalAiService } from './fal-ai.service';
import { EmotionalPromptGeneratorService } from './emotional-prompt-generator.service';
import { DeepSeekService } from '../deepseek/deepseek.service';
import { AddSubtitlesDto, GenerateVideoDto, PresignAudioDto, GenerateLyricsDto } from './dto';
export declare class VideosService {
    private readonly prisma;
    private readonly ffmpeg;
    private readonly audioAnalysis;
    private readonly sceneSelection;
    private readonly clipSelection;
    private readonly pexels;
    private readonly pixabay;
    private readonly falAi;
    private readonly emotionalPromptGenerator;
    private readonly deepseek;
    private readonly logger;
    constructor(prisma: PrismaService, ffmpeg: FfmpegService, audioAnalysis: AudioAnalysisService, sceneSelection: SceneSelectionService, clipSelection: ClipSelectionService, pexels: PexelsService, pixabay: PixabayService, falAi: FalAiService, emotionalPromptGenerator: EmotionalPromptGeneratorService, deepseek: DeepSeekService);
    presignAudio(dto: PresignAudioDto): Promise<{
        uploadUrl: string;
        cloud_storage_path: string;
    }>;
    generateLyrics(dto: GenerateLyricsDto): Promise<{
        title: string;
        theme: string;
        lyrics: string;
        generatedAt: Date;
    }>;
    list(): Promise<{
        items: any[];
    }>;
    get(id: string): Promise<any>;
    addSubtitles(id: string, dto: AddSubtitlesDto): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    generate(dto: GenerateVideoDto): Promise<any>;
    private processVideoAsync;
}
