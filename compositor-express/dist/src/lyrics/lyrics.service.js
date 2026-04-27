"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LyricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LyricsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const llm_service_1 = require("../llm/llm.service");
const GENERATE_SYSTEM = "Eres un experto escritor y poeta especializado en flamenquito fusión. Creas letras con mucho sentimiento, autenticidad y pasión flamenca. Tus letras tienen la estructura típica del género con estrofas y estribillos. Responde SOLO en formato JSON con campos 'title' y 'content'. El content debe usar saltos de línea para separar versos y líneas vacías entre estrofas.";
const ANALYZE_SYSTEM = "Eres un experto analista de letras de flamenquito fusión. Analiza la siguiente letra y sugiere mejoras manteniendo la esencia del género. Para cada sugerencia, indica el texto original exacto, entre 3 y 5 alternativas, la posición (start/end como índices de caracteres), la severidad (critical/suggested/optional) y la razón. Responde SOLO en formato JSON con un array 'suggestions' donde cada item tiene: originalText (string), suggestedTexts (string[]), positionStart (number), positionEnd (number), severity (string), reason (string).";
const IMPROVE_SYSTEM = "Eres un experto poeta de flamenquito fusión. Proporciona 4 alternativas más emotivas y auténticas para la frase dada, considerando el contexto de la canción. Responde SOLO en formato JSON con un array 'alternatives' de strings.";
let LyricsService = LyricsService_1 = class LyricsService {
    prisma;
    llm;
    logger = new common_1.Logger(LyricsService_1.name);
    constructor(prisma, llm) {
        this.prisma = prisma;
        this.llm = llm;
    }
    async create(dto) {
        return this.prisma.lyric.create({ data: dto });
    }
    async list(q) {
        const page = Number(q.page) || 1;
        const limit = Number(q.limit) || 20;
        const where = {};
        if (q.theme)
            where.theme = q.theme;
        if (q.emotion)
            where.emotion = q.emotion;
        if (q.style)
            where.style = q.style;
        if (q.isFavorite !== undefined) {
            const fav = q.isFavorite === true || q.isFavorite === 'true';
            where.isFavorite = fav;
        }
        if (q.search) {
            where.OR = [
                { title: { contains: q.search, mode: 'insensitive' } },
                { content: { contains: q.search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.lyric.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
            this.prisma.lyric.count({ where }),
        ]);
        return { items, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getById(id) {
        const lyric = await this.prisma.lyric.findUnique({ where: { id }, include: { suggestions: { orderBy: { createdAt: 'desc' } } } });
        if (!lyric)
            throw new common_1.NotFoundException('Lyric not found');
        return lyric;
    }
    async update(id, dto) {
        await this.ensureExists(id);
        return this.prisma.lyric.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.ensureExists(id);
        await this.prisma.lyric.delete({ where: { id } });
        return { success: true };
    }
    async toggleFavorite(id) {
        const lyric = await this.ensureExists(id);
        return this.prisma.lyric.update({ where: { id }, data: { isFavorite: !lyric.isFavorite } });
    }
    async stats() {
        const [totalLyrics, totalFavorites] = await Promise.all([
            this.prisma.lyric.count(),
            this.prisma.lyric.count({ where: { isFavorite: true } }),
        ]);
        return { totalLyrics, totalFavorites };
    }
    async generate(dto) {
        const userPrompt = `Idea: ${dto.idea}\n${dto.theme ? `Tema: ${dto.theme}\n` : ''}${dto.emotion ? `Emoción: ${dto.emotion}\n` : ''}${dto.style ? `Estilo: ${dto.style}\n` : ''}\nGenera la letra en formato JSON con 'title' y 'content'.`;
        const result = await this.llm.chatJson(GENERATE_SYSTEM, userPrompt);
        return { title: result.title || 'Sin título', content: result.content || '' };
    }
    async analyze(dto) {
        const userPrompt = `Letra a analizar (en JSON):\n${dto.content}`;
        const result = await this.llm.chatJson(ANALYZE_SYSTEM, userPrompt);
        const suggestions = Array.isArray(result.suggestions) ? result.suggestions : [];
        if (dto.lyricId) {
            try {
                await this.prisma.suggestion.createMany({
                    data: suggestions.map((s) => ({
                        lyricId: dto.lyricId,
                        originalText: String(s.originalText ?? ''),
                        suggestedTexts: Array.isArray(s.suggestedTexts) ? s.suggestedTexts.map(String) : [],
                        positionStart: Number(s.positionStart ?? 0),
                        positionEnd: Number(s.positionEnd ?? 0),
                        severity: String(s.severity ?? 'suggested'),
                        reason: String(s.reason ?? ''),
                    })),
                });
            }
            catch (e) {
                this.logger.warn(`Failed to persist suggestions: ${e.message}`);
            }
        }
        return { suggestions };
    }
    async improve(dto) {
        const userPrompt = `Texto original: "${dto.text}"\nContexto de la canción:\n${dto.context}\n\nResponde en JSON con 'alternatives'.`;
        const result = await this.llm.chatJson(IMPROVE_SYSTEM, userPrompt);
        return { alternatives: Array.isArray(result.alternatives) ? result.alternatives : [] };
    }
    async ensureExists(id) {
        const lyric = await this.prisma.lyric.findUnique({ where: { id } });
        if (!lyric)
            throw new common_1.NotFoundException('Lyric not found');
        return lyric;
    }
};
exports.LyricsService = LyricsService;
exports.LyricsService = LyricsService = LyricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, llm_service_1.LlmService])
], LyricsService);
//# sourceMappingURL=lyrics.service.js.map