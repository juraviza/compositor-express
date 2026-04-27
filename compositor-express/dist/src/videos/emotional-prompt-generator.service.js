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
var EmotionalPromptGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmotionalPromptGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const llm_service_1 = require("../llm/llm.service");
let EmotionalPromptGeneratorService = EmotionalPromptGeneratorService_1 = class EmotionalPromptGeneratorService {
    llm;
    logger = new common_1.Logger(EmotionalPromptGeneratorService_1.name);
    constructor(llm) {
        this.llm = llm;
    }
    async generateVideoPrompts(title, lyrics, artistName = 'Juan Rafael') {
        const sys = `You are an ELITE Hollywood cinematographer specializing in flamenco music videos. Create CINEMATIC, PROFESSIONAL video prompts for Fal.ai that rival Netflix/Premium TV productions.

CRITICAL RULES FOR PROFESSIONAL VIDEOS:
1. Generate 4-5 DETAILED CINEMATIC PROMPTS (1-2 sentences each, action-focused)
2. Each prompt MUST describe visible MOVEMENT, CAMERA WORK, LIGHTING, and EMOTIONAL INTENSITY
3. Use PROFESSIONAL cinematography language (rack focus, Dutch angle, 24fps cinematic, color grade, bokeh, etc.)
4. Include SPECIFIC VISUAL ELEMENTS: dancers' hands, silk fabrics, fire, water, architectural details, facial expressions
5. Every prompt should inspire 4-10 second cinematic sequences with MOVEMENT and DRAMA
6. Ground prompts in Spanish Flamenco culture authentically
7. Focus on EMOTION through VISUAL STORYTELLING, not dialogue or text

Return ONLY valid JSON: { "emotion": "...", "visualStyle": "...", "musicSentiment": "...", "prompts": ["cinematic prompt 1", "cinematic prompt 2", ...] }`;
        const user = `Title: "${title}"
Artist: ${artistName}

Lyrics:
"""${(lyrics || '').slice(0, 1200)}"""

Create 4-5 PROFESSIONAL CINEMATIC PROMPTS for AI video generation. Each must be:
- 1-2 sentences, densely descriptive
- Specific camera techniques and movements
- Professional cinematography terms (Dutch angle, shallow DOF, color grade, cinematic lighting)
- MOVEMENT-focused (dancers, hands, fabrics, elements in motion)
- EMOTIONAL INTENSITY matched to the song's sentiment
- Spanish/Andalusian cultural authenticity

Output JSON with: emotion, visualStyle, musicSentiment, prompts (as array of cinema-grade prompts).`;
        try {
            const data = await this.llm.chatJson(sys, user, 30000);
            if (data?.emotion && Array.isArray(data.prompts) && data.prompts.length >= 2) {
                this.logger.log(`Generated emotional prompts for "${title}": emotion=${data.emotion}, style=${data.visualStyle}`);
                return data;
            }
        }
        catch (e) {
            this.logger.warn(`Emotional prompt generation failed: ${e?.message}`);
        }
        return this.getFallbackPrompts(title, lyrics, artistName);
    }
    getFallbackPrompts(title, lyrics, artistName) {
        const hasLove = /amor|te amo|amarte|coraz[óo]n|mi alma/i.test(lyrics);
        const hasPain = /dolor|sufro|llorar|pena|tristeza|duele/i.test(lyrics);
        const hasPassion = /fuego|llamas|ardor|pasi[óo]n|intenso/i.test(lyrics);
        const hasRage = /rabia|ira|furioso|venganza|odio/i.test(lyrics);
        const hasNature = /flores|rosas|mar|cielo|luna|estrellas/i.test(lyrics);
        let emotion = 'melancholic';
        let visualStyle = 'dark, moody, cinematic';
        let musicSentiment = 'introspective';
        let basePrompts = [];
        if (hasPassion && hasPain) {
            emotion = 'passionate melancholy';
            visualStyle = 'red and gold tones, dramatic shadows, close-ups of hands and eyes';
            musicSentiment = 'intensely emotional, bittersweet';
            basePrompts = [
                `Extreme close-up of a flamenco dancer's trembling hands in shallow focus, dramatic sidelighting revealing goosebumps and tension. Deep red silk drapes flow with kinetic energy, creating bokeh patterns. Warm 35mm color grade with crushed blacks, 24fps cinematic rhythm.`,
                `Dynamic wide shot: silhouette of a passionate figure moving through golden flames and dark smoke, rack focus from face to hands, Dutch angle composition, cinematic depth-of-field separating dancer from fiery background. Intense duende energy.`,
                `Macro cinematography of red roses with water droplets in slow motion, bokeh garden lights behind, dancer's hands entering frame with percussion gestures, warm sepia color grade shifting to deep crimsons. Romantic yet anguished.`,
                `Overhead tracking shot following dancer's feet across wet stone floor, golden light streaking through architectural shadows, cinematic dust particles visible, hands reaching upward, intense emotional release. Spanish baroque architecture framing.`,
            ];
        }
        else if (hasLove) {
            emotion = 'romantic longing';
            visualStyle = 'warm golds, soft focus, intimate close-ups';
            musicSentiment = 'tender, yearning, sensual';
            basePrompts = [
                `Intimate shallow-focus cinematography: two hands almost touching with candlelight bokeh in warm gold tones, cinematic fingertip trembling, soft 50mm lens feel, Spanish garden architecture blurred behind, 24fps slow sensuality.`,
                `Silhouette tracking shot of two figures moving slowly through starlit Andalusian night, romantic golden rim lighting, graceful hand gestures with emotional depth, yearning camera movement following their connected energy.`,
                `Slow-motion red rose petals cascading through golden diffused light, Spanish courtyard architectural framing, intimate bokeh background, cinematic dust particles visible, warm sepia-to-amber color grade, romantic tenderness.`,
            ];
        }
        else if (hasRage || hasPassion) {
            emotion = 'fierce, defiant passion';
            visualStyle = 'deep reds, blacks, dramatic dynamic movement';
            musicSentiment = 'powerful, explosive, intense';
            basePrompts = [
                `Explosive dynamic wide shot: flamenco dancer's feet stomping with powerful force, dust rising with cinematic lighting, red and black color grading, fire elements visible behind, intense hand clapping percussion with motion blur, Dutch angle framing raw duende energy.`,
                `High-energy montage of passionate hand gestures cutting rapidly between silhouettes and fiery backgrounds, dramatic chiaroscuro lighting, intense facial expressions with shallow DOF, powerful Andalusian percussion motion, explosive emotional release.`,
                `Extreme close-up of dancer's eyes blazing with emotional fire, shallow focus on iris, hands blurring in powerful percussion gestures, deep red color grade, fiery bokeh background, cinematic intensity and raw passion.`,
            ];
        }
        else if (hasNature) {
            emotion = 'lyrical, wistful';
            visualStyle = 'natural colors, flowing compositions';
            musicSentiment = 'poetic, reflective';
            basePrompts = [
                `Flowing cinematography of a figure moving through wildflower fields with soft natural light, water reflections creating depth, contemplative tracking shot with cinematic shallow DOF, Andalusian countryside architecture framing, poetic melancholic mood.`,
                `Ethereal tracking shot: moon and stars reflecting in still water, silhouettes of cypress trees and baroque architecture, dreamlike cinematic grading, slow contemplative movement, peaceful yet wistful emotional atmosphere.`,
                `Wide establishing shot of wildflowers swaying in wind with distant mountains, golden hour cinematic lighting, subtle camera drift, emotional emptiness and natural beauty combined, reflective and poetic energy.`,
            ];
        }
        else {
            emotion = 'mysterious, introspective';
            visualStyle = 'moody, atmospheric, shadows and light';
            musicSentiment = 'contemplative, deep, introspective';
            basePrompts = [
                `Moody cinema: figure in chiaroscuro dramatic side-lighting, slow contemplative movement through Spanish baroque interior with ancient stone architecture, cinematic color grading with crushed shadows, mysterious introspective atmosphere, 24fps atmospheric.`,
                `Atmospheric nighttime Spanish street: silhouettes moving slowly past candlelit windows with warm bokeh, cinematic mist and atmospheric lighting, introspective energy, mysterious baroque architecture shadows, moody color grade.`,
                `Extreme close-up of weathered aged hands with shallow focus, warm sepia-to-gold cinematic color grade, slow meaningful gestural movements telling a wordless story, introspective deep emotion, textured intimate cinematography.`,
            ];
        }
        return {
            emotion,
            visualStyle,
            musicSentiment,
            prompts: basePrompts,
        };
    }
};
exports.EmotionalPromptGeneratorService = EmotionalPromptGeneratorService;
exports.EmotionalPromptGeneratorService = EmotionalPromptGeneratorService = EmotionalPromptGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [llm_service_1.LlmService])
], EmotionalPromptGeneratorService);
//# sourceMappingURL=emotional-prompt-generator.service.js.map