"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LlmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmService = void 0;
const common_1 = require("@nestjs/common");
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
let LlmService = LlmService_1 = class LlmService {
    logger = new common_1.Logger(LlmService_1.name);
    async chatJson(systemPrompt, userPrompt, timeoutMs = 60000) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new common_1.InternalServerErrorException('GROQ_API_KEY not configured');
        }
        const systemWithJson = systemPrompt.includes('json')
            ? systemPrompt
            : systemPrompt + '\n\nAlways respond with valid JSON.';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: [
                        { role: 'system', content: systemWithJson },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.7,
                }),
                signal: controller.signal,
            });
            if (!response.ok) {
                const errBody = await response.text();
                this.logger.error(`Groq request failed (${response.status}): ${errBody}`);
                throw new common_1.InternalServerErrorException(`Groq request failed: ${response.status}`);
            }
            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (!content) {
                this.logger.error(`Groq returned empty content: ${JSON.stringify(data)}`);
                throw new common_1.InternalServerErrorException('Groq returned empty content');
            }
            try {
                return JSON.parse(content);
            }
            catch (e) {
                this.logger.error(`Failed to parse Groq JSON: ${content}`);
                const match = content.match(/\{[\s\S]*\}/);
                if (match) {
                    try {
                        return JSON.parse(match[0]);
                    }
                    catch { }
                }
                throw new common_1.InternalServerErrorException('Failed to parse LLM response as JSON');
            }
        }
        catch (err) {
            if (err?.name === 'AbortError') {
                this.logger.error('Groq request timed out');
                throw new common_1.InternalServerErrorException('Groq request timed out');
            }
            throw err;
        }
        finally {
            clearTimeout(timeout);
        }
    }
};
exports.LlmService = LlmService;
exports.LlmService = LlmService = LlmService_1 = __decorate([
    (0, common_1.Injectable)()
], LlmService);
//# sourceMappingURL=llm.service.js.map