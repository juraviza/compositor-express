import { LlmService } from '../llm/llm.service';
export interface EmotionalPromptResult {
    prompts: string[];
    emotion: string;
    visualStyle: string;
    musicSentiment: string;
}
export declare class EmotionalPromptGeneratorService {
    private readonly llm;
    private readonly logger;
    constructor(llm: LlmService);
    generateVideoPrompts(title: string, lyrics: string, artistName?: string): Promise<EmotionalPromptResult>;
    private getFallbackPrompts;
}
