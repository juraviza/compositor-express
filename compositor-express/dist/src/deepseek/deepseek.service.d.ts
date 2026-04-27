export interface DeepSeekMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface DeepSeekResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export declare class DeepSeekService {
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    generateSongLyrics(title: string, theme: string, style?: string, language?: string): Promise<string | null>;
    generateCinematicPromptsFromLyrics(title: string, lyrics: string, artistName?: string, numScenes?: number): Promise<{
        emotion: string;
        visualStyle: string;
        musicSentiment: string;
        prompts: string[];
        sceneNarrative: string;
    } | null>;
    improveLyrics(originalLyrics: string, improvements: string): Promise<string | null>;
    private callDeepSeekApi;
}
