export declare class CreateLyricDto {
    title: string;
    content: string;
    originalIdea?: string;
    theme?: string;
    emotion?: string;
    style?: string;
    isFavorite?: boolean;
}
export declare class UpdateLyricDto {
    title?: string;
    content?: string;
    theme?: string;
    emotion?: string;
    style?: string;
    isFavorite?: boolean;
}
export declare class ListLyricsQueryDto {
    search?: string;
    theme?: string;
    emotion?: string;
    style?: string;
    isFavorite?: boolean | string;
    page?: number;
    limit?: number;
}
export declare class GenerateLyricDto {
    idea: string;
    theme?: string;
    emotion?: string;
    style?: string;
}
export declare class AnalyzeLyricDto {
    lyricId?: string;
    content: string;
}
export declare class ImproveTextDto {
    text: string;
    context: string;
}
export declare class ApplySuggestionDto {
    appliedText: string;
}
