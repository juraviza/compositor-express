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
var SceneSelectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneSelectionService = void 0;
const common_1 = require("@nestjs/common");
const llm_service_1 = require("../llm/llm.service");
const scenes_1 = require("./scenes");
let SceneSelectionService = SceneSelectionService_1 = class SceneSelectionService {
    llm;
    logger = new common_1.Logger(SceneSelectionService_1.name);
    constructor(llm) {
        this.llm = llm;
    }
    async selectScenes(lyrics, count = 7) {
        const ids = scenes_1.SCENE_LIBRARY.map(s => s.id);
        const catalog = scenes_1.SCENE_LIBRARY.map(s => `- ${s.id}: ${s.description} (tags: ${s.tags.join(', ')})`).join('\n');
        const sys = 'Eres un director artístico experto en videos musicales flamencos. Tu tarea es escoger imágenes que cuenten visualmente la historia de la letra. Devuelve SOLO un JSON con la forma exacta { "scenes": ["id1", "id2", ...] } sin explicaciones.';
        const user = `Letra de la canción:\n"""\n${(lyrics || '').slice(0, 2000)}\n"""\n\nCatálogo de imágenes disponibles (usa SOLO los IDs listados):\n${catalog}\n\nElige exactamente ${count} imágenes en orden cinematográfico que mejor representen el sentimiento, los temas y la progresión emocional de la letra. Varía los planos para que el video sea visualmente rico (alterna detalle/amplio, gente/lugar/abstracto). Responde SOLO el JSON: { "scenes": ["id", ...] }`;
        let chosen = [];
        try {
            const data = await this.llm.chatJson(sys, user, 30000);
            if (Array.isArray(data?.scenes))
                chosen = data.scenes;
        }
        catch (e) {
            this.logger.warn(`Scene LLM selection failed: ${e?.message}`);
        }
        const valid = chosen.map(c => scenes_1.SCENE_LIBRARY.find(s => s.id === c)).filter((s) => !!s);
        if (valid.length < count) {
            const fallbackOrder = [
                'dancer_silhouette', 'guitar_close', 'rose_dark', 'flamenco_show', 'red_smoke',
                'couple_dance', 'fire_embers', 'andalusia_street', 'moon_clouds', 'dancer_passion',
                'wine_glass', 'sunset_andalusia',
            ];
            for (const id of fallbackOrder) {
                if (valid.length >= count)
                    break;
                if (!valid.find(v => v.id === id)) {
                    const s = scenes_1.SCENE_LIBRARY.find(x => x.id === id);
                    if (s)
                        valid.push(s);
                }
            }
        }
        return valid.slice(0, count);
    }
};
exports.SceneSelectionService = SceneSelectionService;
exports.SceneSelectionService = SceneSelectionService = SceneSelectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [llm_service_1.LlmService])
], SceneSelectionService);
//# sourceMappingURL=scene-selection.service.js.map