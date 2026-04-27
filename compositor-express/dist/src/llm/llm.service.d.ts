export declare class LlmService {
    private readonly logger;
    chatJson<T = any>(systemPrompt: string, userPrompt: string, timeoutMs?: number): Promise<T>;
}
