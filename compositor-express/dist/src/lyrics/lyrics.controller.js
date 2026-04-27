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
exports.LyricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lyrics_service_1 = require("./lyrics.service");
const lyrics_dto_1 = require("./dto/lyrics.dto");
let LyricsController = class LyricsController {
    service;
    constructor(service) {
        this.service = service;
    }
    stats() { return this.service.stats(); }
    generate(dto) { return this.service.generate(dto); }
    analyze(dto) { return this.service.analyze(dto); }
    improve(dto) { return this.service.improve(dto); }
    create(dto) { return this.service.create(dto); }
    list(q) { return this.service.list(q); }
    get(id) { return this.service.getById(id); }
    patch(id, dto) { return this.service.update(id, dto); }
    put(id, dto) { return this.service.update(id, dto); }
    remove(id) { return this.service.remove(id); }
    toggleFav(id) { return this.service.toggleFavorite(id); }
};
exports.LyricsController = LyricsController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get aggregate stats (totalLyrics, totalFavorites)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "stats", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate flamenquito fusion lyric from an idea using LLM' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lyrics_dto_1.GenerateLyricDto]),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze lyric and return suggestions' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lyrics_dto_1.AnalyzeLyricDto]),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "analyze", null);
__decorate([
    (0, common_1.Post)('improve'),
    (0, swagger_1.ApiOperation)({ summary: 'Suggest alternatives to improve a specific section' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lyrics_dto_1.ImproveTextDto]),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "improve", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Save a lyric' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lyrics_dto_1.CreateLyricDto]),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List lyrics with filters and pagination' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lyrics_dto_1.ListLyricsQueryDto]),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a lyric by id' }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a lyric' }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lyrics_dto_1.UpdateLyricDto]),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "patch", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a lyric (full)' }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lyrics_dto_1.UpdateLyricDto]),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "put", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a lyric' }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/favorite'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle favorite status' }),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LyricsController.prototype, "toggleFav", null);
exports.LyricsController = LyricsController = __decorate([
    (0, swagger_1.ApiTags)('lyrics'),
    (0, common_1.Controller)('api/lyrics'),
    __metadata("design:paramtypes", [lyrics_service_1.LyricsService])
], LyricsController);
//# sourceMappingURL=lyrics.controller.js.map