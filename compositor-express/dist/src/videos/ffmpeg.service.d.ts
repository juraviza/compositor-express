import { TemplateId } from './templates';
import { TitleFontType } from './dto';
export type Format = 'vertical' | 'horizontal';
export interface MusicVideoParams {
    audioLocalPath: string;
    outputPath: string;
    format: Format;
    template: TemplateId;
    segmentStart: number;
    segmentEnd: number;
    scenes: string[];
    title?: string;
    titleFont?: TitleFontType;
}
export declare class FfmpegService {
    private readonly logger;
    private readonly logoPath;
    private gradeForTemplate;
    private pickTransitions;
    private kenBurns;
    generateMusicVideoFromClips(params: {
        audioLocalPath: string;
        outputPath: string;
        format: Format;
        template: TemplateId;
        segmentStart: number;
        segmentEnd: number;
        clips: string[];
        title?: string;
        titleFont?: TitleFontType;
    }): Promise<void>;
    generateMusicVideo(params: MusicVideoParams): Promise<void>;
    private escapeDrawText;
    burnSubtitles(params: {
        inputVideoPath: string;
        outputPath: string;
        lines: string[];
        fontPath: string;
        fontSize: number;
        color: string;
        strokeColor?: string;
        position: 'top' | 'center' | 'bottom';
    }): Promise<void>;
    private runFfmpeg;
    probeDuration(filePath: string): Promise<number>;
    compositeVideos(params: {
        bgVideoPath: string;
        avatarVideoPath: string;
        audioPath: string;
        outputPath: string;
        format: Format;
    }): Promise<void>;
    tmpFile(ext: string): string;
    safeUnlink(p?: string): Promise<void>;
}
