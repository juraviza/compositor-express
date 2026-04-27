export declare const AVAILABLE_TITLE_FONTS: readonly ["DejaVuSans-Bold", "Hunters", "Blacksword", "Hello Valentina", "Cream Cake", "Cream Cake Bold", "BillionDreams"];
export type TitleFontType = typeof AVAILABLE_TITLE_FONTS[number];
export declare class PresignAudioDto {
    fileName: string;
    contentType?: string;
}
export declare class GenerateVideoDto {
    lyricId?: string;
    title: string;
    audioPath: string;
    lyricsText: string;
    format: 'vertical' | 'horizontal';
    template: 'pasion' | 'noche' | 'duende' | 'fiesta';
    autoSelect?: boolean;
    segmentStart?: number;
    segmentEnd?: number;
    artistName?: string;
    titleFont?: TitleFontType;
}
export declare class AddSubtitlesDto {
    lines?: string[];
    fontFamily: string;
    fontSize?: number;
    color?: string;
    strokeColor?: string;
    position?: 'top' | 'center' | 'bottom';
}
export declare class GenerateLyricsDto {
    title: string;
    theme: string;
    style?: string;
    language?: string;
}
