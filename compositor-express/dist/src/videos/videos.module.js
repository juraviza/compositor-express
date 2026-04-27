"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosModule = void 0;
const common_1 = require("@nestjs/common");
const videos_controller_1 = require("./videos.controller");
const videos_service_1 = require("./videos.service");
const ffmpeg_service_1 = require("./ffmpeg.service");
const audio_analysis_service_1 = require("./audio-analysis.service");
const scene_selection_service_1 = require("./scene-selection.service");
const pexels_service_1 = require("./pexels.service");
const pixabay_service_1 = require("./pixabay.service");
const clip_selection_service_1 = require("./clip-selection.service");
const keyword_extractor_service_1 = require("./keyword-extractor.service");
const fal_ai_service_1 = require("./fal-ai.service");
const emotional_prompt_generator_service_1 = require("./emotional-prompt-generator.service");
const llm_module_1 = require("../llm/llm.module");
const deepseek_module_1 = require("../deepseek/deepseek.module");
let VideosModule = class VideosModule {
};
exports.VideosModule = VideosModule;
exports.VideosModule = VideosModule = __decorate([
    (0, common_1.Module)({
        imports: [llm_module_1.LlmModule, deepseek_module_1.DeepSeekModule],
        controllers: [videos_controller_1.VideosController],
        providers: [videos_service_1.VideosService, ffmpeg_service_1.FfmpegService, audio_analysis_service_1.AudioAnalysisService, scene_selection_service_1.SceneSelectionService, pexels_service_1.PexelsService, pixabay_service_1.PixabayService, clip_selection_service_1.ClipSelectionService, keyword_extractor_service_1.KeywordExtractorService, fal_ai_service_1.FalAiService, emotional_prompt_generator_service_1.EmotionalPromptGeneratorService],
    })
], VideosModule);
//# sourceMappingURL=videos.module.js.map