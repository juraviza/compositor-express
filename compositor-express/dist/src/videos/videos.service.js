"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VideosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ffmpeg_service_1 = require("./ffmpeg.service");
const audio_analysis_service_1 = require("./audio-analysis.service");
const scene_selection_service_1 = require("./scene-selection.service");
const clip_selection_service_1 = require("./clip-selection.service");
const pexels_service_1 = require("./pexels.service");
const pixabay_service_1 = require("./pixabay.service");
const fal_ai_service_1 = require("./fal-ai.service");
const emotional_prompt_generator_service_1 = require("./emotional-prompt-generator.service");
const deepseek_service_1 = require("../deepseek/deepseek.service");
const s3_1 = require("../lib/s3");
const fonts_1 = require("./fonts");
const aws_config_1 = require("../lib/aws-config");
const scenes_1 = require("./scenes");
const fs = __importStar(require("fs"));
function cleanLyricsForSubs(raw) {
    if (!raw)
        return [];
    return raw
        .split(/\r?/)
        .map(l => l
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\([^)]*\)/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim())
        .filter(l => l.length > 0 && !/^[-_*=~]+$/.test(l));
}
function autoDetectSegmentLyrics(lyricsText, segmentStart, segmentEnd, audioDurationSec) {
    const all = cleanLyricsForSubs(lyricsText);
    if (all.length === 0)
        return [];
    const total = audioDurationSec && audioDurationSec > 0 ? audioDurationSec : 0;
    if (!total || segmentEnd <= segmentStart)
        return all;
    const startProp = Math.max(0, Math.min(0.99, segmentStart / total));
    const endProp = Math.max(startProp + 0.01, Math.min(1, segmentEnd / total));
    const startIdx = Math.min(all.length - 1, Math.floor(startProp * all.length));
    const endIdx = Math.max(startIdx + 1, Math.ceil(endProp * all.length));
    return all.slice(startIdx, Math.min(all.length, endIdx));
}
let VideosService = VideosService_1 = class VideosService {
    prisma;
    ffmpeg;
    audioAnalysis;
    sceneSelection;
    clipSelection;
    pexels;
    pixabay;
    falAi;
    emotionalPromptGenerator;
    deepseek;
    logger = new common_1.Logger(VideosService_1.name);
    constructor(prisma, ffmpeg, audioAnalysis, sceneSelection, clipSelection, pexels, pixabay, falAi, emotionalPromptGenerator, deepseek) {
        this.prisma = prisma;
        this.ffmpeg = ffmpeg;
        this.audioAnalysis = audioAnalysis;
        this.sceneSelection = sceneSelection;
        this.clipSelection = clipSelection;
        this.pexels = pexels;
        this.pixabay = pixabay;
        this.falAi = falAi;
        this.emotionalPromptGenerator = emotionalPromptGenerator;
        this.deepseek = deepseek;
    }
    async presignAudio(dto) {
        const safeName = (dto.fileName || 'audio.mp3').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
        const ct = dto.contentType || 'audio/mpeg';
        const { uploadUrl, cloud_storage_path } = await (0, s3_1.generatePresignedUploadUrl)(safeName, ct, false);
        return { uploadUrl, cloud_storage_path };
    }
    async generateLyrics(dto) {
        this.logger.log(`🎵 Generating professional flamenco lyrics: "${dto.title}" - Theme: ${dto.theme}`);
        const lyrics = await this.deepseek.generateSongLyrics(dto.title, dto.theme, dto.style || 'flamenco', dto.language || 'spanish');
        if (!lyrics) {
            throw new common_1.BadRequestException('No se pudieron generar las letras. Intenta de nuevo.');
        }
        return {
            title: dto.title,
            theme: dto.theme,
            lyrics,
            generatedAt: new Date(),
        };
    }
    async list() {
        const items = await this.prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
        const enriched = await Promise.all(items.map(async (v) => ({
            ...v,
            videoUrl: v.videoPath && v.status === 'ready' ? await (0, s3_1.getFileUrl)(v.videoPath, false) : null,
            videoSubtitlesUrl: v.videoSubtitlesPath ? await (0, s3_1.getFileUrl)(v.videoSubtitlesPath, false) : null,
        })));
        return { items: enriched };
    }
    async get(id) {
        const v = await this.prisma.video.findUnique({ where: { id } });
        if (!v)
            throw new common_1.NotFoundException('Video no encontrado');
        return {
            ...v,
            videoUrl: v.videoPath && v.status === 'ready' ? await (0, s3_1.getFileUrl)(v.videoPath, false) : null,
            videoSubtitlesUrl: v.videoSubtitlesPath ? await (0, s3_1.getFileUrl)(v.videoSubtitlesPath, false) : null,
            audioUrl: v.audioPath ? await (0, s3_1.getFileUrl)(v.audioPath, false) : null,
        };
    }
    async addSubtitles(id, dto) {
        const v = await this.prisma.video.findUnique({ where: { id } });
        if (!v)
            throw new common_1.NotFoundException('Video no encontrado');
        if (!v.videoPath)
            throw new common_1.BadRequestException('El video todavía no se ha generado.');
        const fontPath = (0, fonts_1.getFontFilePath)(dto.fontFamily);
        if (!fontPath)
            throw new common_1.BadRequestException('Tipografía no encontrada.');
        let lines = (dto.lines || []).map(s => String(s ?? '').trim()).filter(s => s.length > 0);
        if (lines.length === 0) {
            lines = autoDetectSegmentLyrics(v.lyricsText ?? '', v.segmentStart ?? 0, v.segmentEnd ?? (v.segmentStart ?? 0) + (v.durationSec ?? 60), v.audioDurationSec ?? null);
            if (lines.length === 0) {
                throw new common_1.BadRequestException('No se pudo detectar la letra del fragmento. Edita la letra antes de generar.');
            }
            this.logger.log(`Auto-detected ${lines.length} subtitle lines from segment.`);
        }
        const fontSize = Math.max(20, Math.min(140, dto.fontSize ?? 56));
        const color = (dto.color ?? 'FFFFFF').replace(/^#/, '').toUpperCase();
        const strokeColor = (dto.strokeColor ?? '000000').replace(/^#/, '').toUpperCase();
        const position = (dto.position ?? 'bottom');
        let inputLocal;
        let outputLocal;
        try {
            inputLocal = this.ffmpeg.tmpFile('mp4');
            outputLocal = this.ffmpeg.tmpFile('mp4');
            this.logger.log(`Downloading source video: ${v.videoPath}`);
            await (0, s3_1.downloadToFile)(v.videoPath, inputLocal);
            await this.ffmpeg.burnSubtitles({
                inputVideoPath: inputLocal,
                outputPath: outputLocal,
                lines,
                fontPath,
                fontSize,
                color,
                strokeColor,
                position,
            });
            if (v.videoSubtitlesPath) {
                try {
                    await (0, s3_1.deleteFile)(v.videoSubtitlesPath);
                }
                catch { }
            }
            const { folderPrefix } = (0, aws_config_1.getBucketConfig)();
            const cloud_storage_path = `${folderPrefix}videos/${Date.now()}-${v.id}-subs.mp4`;
            await (0, s3_1.uploadFromFile)(outputLocal, cloud_storage_path, 'video/mp4');
            const subtitlesConfig = JSON.stringify({ lines, fontFamily: dto.fontFamily, fontSize, color, strokeColor, position });
            const updated = await this.prisma.video.update({
                where: { id },
                data: { videoSubtitlesPath: cloud_storage_path, subtitlesConfig },
            });
            const videoSubtitlesUrl = await (0, s3_1.getFileUrl)(cloud_storage_path, false);
            const videoUrl = updated.videoPath ? await (0, s3_1.getFileUrl)(updated.videoPath, false) : null;
            return { ...updated, videoUrl, videoSubtitlesUrl };
        }
        catch (e) {
            this.logger.error(`addSubtitles failed: ${e?.message}`);
            throw new common_1.BadRequestException(e?.message || 'No se pudieron añadir subtítulos');
        }
        finally {
            await this.ffmpeg.safeUnlink(inputLocal);
            await this.ffmpeg.safeUnlink(outputLocal);
        }
    }
    async remove(id) {
        const v = await this.prisma.video.findUnique({ where: { id } });
        if (!v)
            throw new common_1.NotFoundException('Video no encontrado');
        if (v.videoPath) {
            try {
                await (0, s3_1.deleteFile)(v.videoPath);
            }
            catch { }
        }
        if (v.videoSubtitlesPath) {
            try {
                await (0, s3_1.deleteFile)(v.videoSubtitlesPath);
            }
            catch { }
        }
        if (v.audioPath) {
            try {
                await (0, s3_1.deleteFile)(v.audioPath);
            }
            catch { }
        }
        await this.prisma.video.delete({ where: { id } });
        return { success: true };
    }
    async generate(dto) {
        const useAuto = dto.autoSelect !== false && (dto.segmentStart === undefined || dto.segmentEnd === undefined);
        const tentativeStart = Math.max(0, dto.segmentStart ?? 0);
        const tentativeEnd = Math.max(tentativeStart + 5, Math.min(dto.segmentEnd ?? tentativeStart + 60, tentativeStart + 60));
        const video = await this.prisma.video.create({
            data: {
                lyricId: dto.lyricId || null,
                title: dto.title,
                audioPath: dto.audioPath,
                format: dto.format,
                template: dto.template,
                segmentStart: tentativeStart,
                segmentEnd: tentativeEnd,
                durationSec: tentativeEnd - tentativeStart,
                status: 'processing',
                lyricsText: dto.lyricsText,
                artistName: dto.artistName || null,
            },
        });
        this.processVideoAsync(video.id, dto, tentativeStart, tentativeEnd, useAuto).catch((e) => {
            this.logger.error(`Background video processing crashed: ${e?.message}`);
        });
        return { ...video, videoUrl: null };
    }
    async processVideoAsync(videoId, dto, tentativeStart, tentativeEnd, useAuto) {
        let localAudio;
        let localVideo;
        const video = { id: videoId };
        try {
            localAudio = this.ffmpeg.tmpFile('mp3');
            localVideo = this.ffmpeg.tmpFile('mp4');
            this.logger.log(`Downloading audio: ${dto.audioPath}`);
            await (0, s3_1.downloadToFile)(dto.audioPath, localAudio);
            const audioDur = await this.ffmpeg.probeDuration(localAudio).catch(() => 0);
            if (audioDur > 0 && tentativeStart >= audioDur) {
                throw new common_1.BadRequestException('El segmento inicial supera la duración del audio.');
            }
            let segmentStart = tentativeStart;
            let segmentEnd = Math.min(tentativeEnd, audioDur > 0 ? audioDur : tentativeEnd);
            if (useAuto) {
                const target = Math.min(60, Math.max(15, audioDur > 0 ? audioDur : 60));
                const found = await this.audioAnalysis.findViralSegment(localAudio, target).catch((e) => {
                    this.logger.warn(`Audio analysis failed, falling back to 0..${target}: ${e?.message}`);
                    return { start: 0, end: target };
                });
                segmentStart = found.start;
                segmentEnd = found.end;
                this.logger.log(`Auto-selected viral segment: ${segmentStart.toFixed(1)}-${segmentEnd.toFixed(1)}`);
            }
            const effDuration = Math.max(8, segmentEnd - segmentStart);
            const sceneCount = effDuration >= 50 ? 7 : effDuration >= 35 ? 6 : effDuration >= 20 ? 5 : 4;
            const canvasW = dto.format === 'vertical' ? 1080 : 1920;
            const canvasH = dto.format === 'vertical' ? 1920 : 1080;
            let clipPaths = [];
            const downloadedClips = [];
            try {
                const variation = Date.now() % 100;
                this.logger.log(`\n🎬 Selecting ${sceneCount} cinematic clips coherent with lyrics...`);
                const clips = await this.clipSelection.selectClips(`${dto.title || ''}\n${dto.lyricsText || ''}`, sceneCount, canvasW, canvasH, variation);
                this.logger.log(`Found ${clips.length} clips: ${clips.map((c) => `${c.source}:"${c.query}":${c.video.id}`).join(', ')}`);
                for (const c of clips) {
                    try {
                        const downloader = c.source === 'pixabay' ? this.pixabay : this.pexels;
                        const fileUrl = c.source === 'pixabay' ? c.file.url : c.file.link;
                        const local = await downloader.downloadToFile(fileUrl, 'mp4');
                        downloadedClips.push(local);
                        clipPaths.push(local);
                        this.logger.log(`📥 Downloaded clip ${clipPaths.length}/${sceneCount} from ${c.source}: "${c.query}"`);
                    }
                    catch (e) {
                        this.logger.error(`Failed to download clip ${c.source}:${c.video.id}: ${e?.message}`);
                    }
                }
                if (clipPaths.length >= 2) {
                    this.logger.log(`\n✨ SUCCESS: Downloaded ${clipPaths.length} cinematic clips`);
                }
            }
            catch (e) {
                this.logger.error(`Clip selection failed: ${e?.message}`);
            }
            try {
                if (clipPaths.length >= 2) {
                    await this.ffmpeg.generateMusicVideoFromClips({
                        audioLocalPath: localAudio,
                        outputPath: localVideo,
                        format: dto.format,
                        template: dto.template,
                        segmentStart,
                        segmentEnd,
                        clips: clipPaths,
                        title: dto.title,
                        titleFont: dto.titleFont,
                    });
                }
                else {
                    this.logger.warn('Falling back to image scenes (Pexels unavailable)');
                    const sceneAssets = await this.sceneSelection.selectScenes(dto.lyricsText || dto.title || '', sceneCount);
                    const scenePaths = sceneAssets.map((s) => (0, scenes_1.getSceneFilePath)(s.file)).filter((p) => fs.existsSync(p));
                    if (scenePaths.length < 2) {
                        throw new Error('No se encontraron clips de video ni im\u00e1genes de respaldo.');
                    }
                    await this.ffmpeg.generateMusicVideo({
                        audioLocalPath: localAudio,
                        outputPath: localVideo,
                        format: dto.format,
                        template: dto.template,
                        segmentStart,
                        segmentEnd,
                        scenes: scenePaths,
                        title: dto.title,
                        titleFont: dto.titleFont,
                    });
                }
            }
            finally {
                for (const p of downloadedClips) {
                    await this.ffmpeg.safeUnlink(p);
                }
            }
            const { folderPrefix } = (0, aws_config_1.getBucketConfig)();
            const cloud_storage_path = `${folderPrefix}videos/${Date.now()}-${video.id}.mp4`;
            await (0, s3_1.uploadFromFile)(localVideo, cloud_storage_path, 'video/mp4');
            const updated = await this.prisma.video.update({
                where: { id: video.id },
                data: {
                    videoPath: cloud_storage_path,
                    status: 'ready',
                    durationSec: effDuration,
                    segmentStart,
                    segmentEnd,
                    audioDurationSec: audioDur > 0 ? audioDur : null,
                },
            });
            this.logger.log(`✅ Video ${video.id} ready (${updated.videoPath})`);
        }
        catch (e) {
            this.logger.error(`Background generate video failed: ${e?.message}`);
            try {
                await this.prisma.video.update({
                    where: { id: video.id },
                    data: { status: 'failed', errorMsg: (e?.message ?? 'Error desconocido').slice(0, 500) },
                });
            }
            catch (e2) {
                this.logger.error(`Failed to mark video as failed: ${e2?.message}`);
            }
        }
        finally {
            await this.ffmpeg.safeUnlink(localAudio);
            await this.ffmpeg.safeUnlink(localVideo);
        }
    }
};
exports.VideosService = VideosService;
exports.VideosService = VideosService = VideosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ffmpeg_service_1.FfmpegService,
        audio_analysis_service_1.AudioAnalysisService,
        scene_selection_service_1.SceneSelectionService,
        clip_selection_service_1.ClipSelectionService,
        pexels_service_1.PexelsService,
        pixabay_service_1.PixabayService,
        fal_ai_service_1.FalAiService,
        emotional_prompt_generator_service_1.EmotionalPromptGeneratorService,
        deepseek_service_1.DeepSeekService])
], VideosService);
//# sourceMappingURL=videos.service.js.map