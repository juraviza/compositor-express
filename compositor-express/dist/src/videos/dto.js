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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateLyricsDto = exports.AddSubtitlesDto = exports.GenerateVideoDto = exports.PresignAudioDto = exports.AVAILABLE_TITLE_FONTS = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
exports.AVAILABLE_TITLE_FONTS = ['DejaVuSans-Bold', 'Hunters', 'Blacksword', 'Hello Valentina', 'Cream Cake', 'Cream Cake Bold', 'BillionDreams'];
class PresignAudioDto {
    fileName;
    contentType;
}
exports.PresignAudioDto = PresignAudioDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'mi-cancion.mp3' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], PresignAudioDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'audio/mpeg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PresignAudioDto.prototype, "contentType", void 0);
class GenerateVideoDto {
    lyricId;
    title;
    audioPath;
    lyricsText;
    format;
    template;
    autoSelect;
    segmentStart;
    segmentEnd;
    artistName;
    titleFont;
}
exports.GenerateVideoDto = GenerateVideoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid', description: 'Optional Lyric id to associate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "lyricId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mi Letra de Flamenquito' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'S3 path returned from /api/videos/audio/presign' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "audioPath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Letra completa de la canción...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "lyricsText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['vertical', 'horizontal'] }),
    (0, class_validator_1.IsIn)(['vertical', 'horizontal']),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['pasion', 'noche', 'duende', 'fiesta'] }),
    (0, class_validator_1.IsIn)(['pasion', 'noche', 'duende', 'fiesta']),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "template", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Detectar automáticamente el segmento más viral del audio' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateVideoDto.prototype, "autoSelect", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GenerateVideoDto.prototype, "segmentStart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 60 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    __metadata("design:type", Number)
], GenerateVideoDto.prototype, "segmentEnd", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Juan Rafael V.Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "artistName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: exports.AVAILABLE_TITLE_FONTS, example: 'Hunters', description: 'Font for the title' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(exports.AVAILABLE_TITLE_FONTS),
    __metadata("design:type", String)
], GenerateVideoDto.prototype, "titleFont", void 0);
class AddSubtitlesDto {
    lines;
    fontFamily;
    fontSize;
    color;
    strokeColor;
    position;
}
exports.AddSubtitlesDto = AddSubtitlesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lines of text in display order. If empty, the server auto-detects the lyrics for the video segment.', example: ['Mi gitana morena', 'baila al son del compás'] }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AddSubtitlesDto.prototype, "lines", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'playfair', description: 'Font ID from /api/videos/fonts' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddSubtitlesDto.prototype, "fontFamily", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 56, description: 'Font size in pixels' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(20),
    __metadata("design:type", Number)
], AddSubtitlesDto.prototype, "fontSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'FFFFFF', description: 'Hex color without #' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddSubtitlesDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '000000', description: 'Stroke/border color hex' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddSubtitlesDto.prototype, "strokeColor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['top', 'center', 'bottom'], example: 'bottom' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['top', 'center', 'bottom']),
    __metadata("design:type", String)
], AddSubtitlesDto.prototype, "position", void 0);
class GenerateLyricsDto {
    title;
    theme;
    style;
    language;
}
exports.GenerateLyricsDto = GenerateLyricsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mi Gitana Morena', description: 'Song title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], GenerateLyricsDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Amor, pasión, duende', description: 'Theme or topic for the lyrics' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], GenerateLyricsDto.prototype, "theme", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'flamenco', description: 'Song style (flamenco, flamenquito, bulería, etc)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateLyricsDto.prototype, "style", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'spanish', description: 'Language for lyrics (spanish, english, etc)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateLyricsDto.prototype, "language", void 0);
//# sourceMappingURL=dto.js.map