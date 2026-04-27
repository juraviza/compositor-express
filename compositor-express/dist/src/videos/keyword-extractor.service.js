"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var KeywordExtractorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordExtractorService = void 0;
const common_1 = require("@nestjs/common");
let KeywordExtractorService = KeywordExtractorService_1 = class KeywordExtractorService {
    logger = new common_1.Logger(KeywordExtractorService_1.name);
    commonWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'my', 'your', 'his', 'her', 'its', 'our', 'their',
        'this', 'that', 'these', 'those',
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
        'de', 'a', 'en', 'y', 'o', 'pero', 'con', 'por', 'para',
        'es', 'está', 'son', 'están', 'era', 'fueron', 'siendo', 'ser',
        'he', 'ha', 'han', 'haya', 'hayas', 'hayamos', 'hayáis', 'hayan',
        'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas',
        'mi', 'mi', 'tu', 'su', 'nuestro', 'vuestro',
        'este', 'ese', 'aquel',
        'que', 'cual', 'quien', 'donde', 'cuando', 'como', 'cuanto',
    ]);
    emotionalWords = [
        'amor', 'te amo', 'amarte', 'eres mía', 'corazón', 'amor mío',
        'love', 'lover', 'beloved', 'heart', 'romance',
        'dolor', 'sufro', 'llorar', 'pena', 'tristeza',
        'pain', 'suffer', 'cry', 'tears', 'broken',
        'alegría', 'fiesta', 'baile', 'celebra',
        'joy', 'party', 'dance', 'celebrate',
        'fuego', 'llamas', 'pasión', 'intenso',
        'fire', 'flames', 'passion', 'intense',
    ];
    extractKeywords(lyricsText, title, randomVariation = 0) {
        const text = `${title} ${lyricsText}`.toLowerCase();
        const words = text
            .split(/[\s\-.,;:!?\/()\[\]{}"']+/)
            .filter((w) => w.length > 2 && !this.commonWords.has(w));
        const freq = new Map();
        words.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
        const scored = Array.from(freq.entries()).map(([word, count]) => {
            let score = count;
            if (this.emotionalWords.some((ew) => word.includes(ew) || ew.includes(word))) {
                score *= 2;
            }
            if (title.toLowerCase().includes(word)) {
                score *= 3;
            }
            return { word, score };
        });
        scored.sort((a, b) => b.score - a.score);
        let keywords = scored.slice(0, 5).map((s) => s.word);
        if (randomVariation > 0 && keywords.length > 0) {
            const skipIdx = randomVariation % keywords.length;
            keywords = keywords.filter((_, i) => i !== skipIdx);
        }
        return keywords.filter((k) => k.length > 0);
    }
    buildSearchQueries(keywords, title, variation = 0) {
        const queries = [];
        if (keywords.length > 0) {
            queries.push(`${title} ${keywords[0]}`);
        }
        else {
            queries.push(title);
        }
        if (keywords.length > 1) {
            queries.push(`${keywords[0]} ${keywords[1]}`);
        }
        if (variation > 0 && keywords.length > 0) {
            queries.push(keywords[Math.min(variation, keywords.length - 1)]);
        }
        queries.push(title);
        return queries.filter((q) => q.length > 0);
    }
};
exports.KeywordExtractorService = KeywordExtractorService;
exports.KeywordExtractorService = KeywordExtractorService = KeywordExtractorService_1 = __decorate([
    (0, common_1.Injectable)()
], KeywordExtractorService);
//# sourceMappingURL=keyword-extractor.service.js.map