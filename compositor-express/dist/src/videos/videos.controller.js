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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const videos_service_1 = require("./videos.service");
const dto_1 = require("./dto");
const templates_1 = require("./templates");
const fonts_1 = require("./fonts");
let VideosController = class VideosController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    templates() {
        return { items: Object.values(templates_1.TEMPLATES) };
    }
    fonts() {
        return { items: fonts_1.FONTS };
    }
    generateLyrics(dto) {
        return this.svc.generateLyrics(dto);
    }
    presign(dto) {
        return this.svc.presignAudio(dto);
    }
    generate(dto) {
        return this.svc.generate(dto);
    }
    list() {
        return this.svc.list();
    }
    get(id) {
        return this.svc.get(id);
    }
    addSubtitles(id, dto) {
        return this.svc.addSubtitles(id, dto);
    }
    remove(id) {
        return this.svc.remove(id);
    }
};
exports.VideosController = VideosController;
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'List available visual templates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "templates", null);
__decorate([
    (0, common_1.Get)('fonts'),
    (0, swagger_1.ApiOperation)({ summary: 'List available subtitle fonts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "fonts", null);
__decorate([
    (0, common_1.Post)('lyrics/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate professional flamenco song lyrics with DeepSeek AI' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateLyricsDto]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "generateLyrics", null);
__decorate([
    (0, common_1.Post)('audio/presign'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a presigned upload URL for the source MP3' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PresignAudioDto]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "presign", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a video for the given audio + lyric segment' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateVideoDto]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List generated videos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single video' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/subtitles'),
    (0, swagger_1.ApiOperation)({ summary: 'Burn customizable subtitles onto an existing video' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddSubtitlesDto]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "addSubtitles", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a video and its assets' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VideosController.prototype, "remove", null);
exports.VideosController = VideosController = __decorate([
    (0, swagger_1.ApiTags)('videos'),
    (0, common_1.Controller)('api/videos'),
    __metadata("design:paramtypes", [videos_service_1.VideosService])
], VideosController);
//# sourceMappingURL=videos.controller.js.map