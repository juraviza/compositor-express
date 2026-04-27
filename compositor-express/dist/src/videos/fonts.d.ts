export interface FontDef {
    id: string;
    name: string;
    file: string;
    style: string;
}
export declare const FONTS: FontDef[];
export declare function resolveFontsDir(): string;
export declare function getFontFilePath(fontId: string): string | null;
