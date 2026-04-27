import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FfmpegService } from './ffmpeg.service';
import { AudioAnalysisService } from './audio-analysis.service';
import { SceneSelectionService } from './scene-selection.service';
import { ClipSelectionService } from './clip-selection.service';
import { PexelsService } from './pexels.service';
import { PixabayService } from './pixabay.service';
import { FalAiService } from './fal-ai.service';
import { EmotionalPromptGeneratorService } from './emotional-prompt-generator.service';
import { DeepSeekService } from '../deepseek/deepseek.service';
import { generatePresignedUploadUrl, getFileUrl, downloadToFile, uploadFromFile, deleteFile } from '../lib/s3';
import { AddSubtitlesDto, GenerateVideoDto, PresignAudioDto, GenerateLyricsDto } from './dto';
import { getFontFilePath } from './fonts';
import { getBucketConfig } from '../lib/aws-config';
import { getSceneFilePath } from './scenes';
import * as fs from 'fs';

function cleanLyricsForSubs(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/\r?/)
    .map(l =>
      l
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\([^)]*\)/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
    )
    .filter(l => l.length > 0 && !/^[-_*=~]+$/.test(l));
}

function autoDetectSegmentLyrics(
  lyricsText: string,
  segmentStart: number,
  segmentEnd: number,
  audioDurationSec: number | null,
): string[] {
  const all = cleanLyricsForSubs(lyricsText);
  if (all.length === 0) return [];
  const total = audioDurationSec && audioDurationSec > 0 ? audioDurationSec : 0;
  if (!total || segmentEnd <= segmentStart) return all;
  const startProp = Math.max(0, Math.min(0.99, segmentStart / total));
  const endProp = Math.max(startProp + 0.01, Math.min(1, segmentEnd / total));
  const startIdx = Math.min(all.length - 1, Math.floor(startProp * all.length));
  const endIdx = Math.max(startIdx + 1, Math.ceil(endProp * all.length));
  return all.slice(startIdx, Math.min(all.length, endIdx));
}

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ffmpeg: FfmpegService,
    private readonly audioAnalysis: AudioAnalysisService,
    private readonly sceneSelection: SceneSelectionService,
    private readonly clipSelection: ClipSelectionService,
    private readonly pexels: PexelsService,
    private readonly pixabay: PixabayService,
    private readonly falAi: FalAiService,
    private readonly emotionalPromptGenerator: EmotionalPromptGeneratorService,
    private readonly deepseek: DeepSeekService,
  ) {}

  async presignAudio(dto: PresignAudioDto) {
    const safeName = (dto.fileName || 'audio.mp3').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
    const ct = dto.contentType || 'audio/mpeg';
    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(safeName, ct, false);
    return { uploadUrl, cloud_storage_path };
  }

  async generateLyrics(dto: GenerateLyricsDto) {
    this.logger.log(`🎵 Generating professional flamenco lyrics: "${dto.title}" - Theme: ${dto.theme}`);

    const lyrics = await this.deepseek.generateSongLyrics(
      dto.title,
      dto.theme,
      dto.style || 'flamenco',
      dto.language || 'spanish',
    );

    if (!lyrics) {
      throw new BadRequestException('No se pudieron generar las letras. Intenta de nuevo.');
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
    const enriched = await Promise.all(items.map(async (v: { videoPath: string | null; status: string; videoSubtitlesPath: string | null }) => ({
      ...v,
      videoUrl: v.videoPath && v.status === 'ready' ? await getFileUrl(v.videoPath, false) : null,
      videoSubtitlesUrl: v.videoSubtitlesPath ? await getFileUrl(v.videoSubtitlesPath, false) : null,
    })));
    return { items: enriched };
  }

  async get(id: string) {
    const v = await this.prisma.video.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('Video no encontrado');
    return {
      ...v,
      videoUrl: v.videoPath && v.status === 'ready' ? await getFileUrl(v.videoPath, false) : null,
      videoSubtitlesUrl: v.videoSubtitlesPath ? await getFileUrl(v.videoSubtitlesPath, false) : null,
      audioUrl: v.audioPath ? await getFileUrl(v.audioPath, false) : null,
    };
  }

  async addSubtitles(id: string, dto: AddSubtitlesDto) {
    const v = await this.prisma.video.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('Video no encontrado');
    if (!v.videoPath) throw new BadRequestException('El video todavía no se ha generado.');
    const fontPath = getFontFilePath(dto.fontFamily);
    if (!fontPath) throw new BadRequestException('Tipografía no encontrada.');
    let lines = (dto.lines || []).map(s => String(s ?? '').trim()).filter(s => s.length > 0);
    if (lines.length === 0) {
      // Auto-detect lyrics for the segment from the stored lyricsText
      lines = autoDetectSegmentLyrics(
        v.lyricsText ?? '',
        v.segmentStart ?? 0,
        v.segmentEnd ?? (v.segmentStart ?? 0) + (v.durationSec ?? 60),
        v.audioDurationSec ?? null,
      );
      if (lines.length === 0) {
        throw new BadRequestException('No se pudo detectar la letra del fragmento. Edita la letra antes de generar.');
      }
      this.logger.log(`Auto-detected ${lines.length} subtitle lines from segment.`);
    }

    const fontSize = Math.max(20, Math.min(140, dto.fontSize ?? 56));
    const color = (dto.color ?? 'FFFFFF').replace(/^#/, '').toUpperCase();
    const strokeColor = (dto.strokeColor ?? '000000').replace(/^#/, '').toUpperCase();
    const position = (dto.position ?? 'bottom') as 'top' | 'center' | 'bottom';

    let inputLocal: string | undefined;
    let outputLocal: string | undefined;
    try {
      inputLocal = this.ffmpeg.tmpFile('mp4');
      outputLocal = this.ffmpeg.tmpFile('mp4');
      this.logger.log(`Downloading source video: ${v.videoPath}`);
      await downloadToFile(v.videoPath, inputLocal);

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

      // Delete previous subtitled variant if present
      if (v.videoSubtitlesPath) {
        try { await deleteFile(v.videoSubtitlesPath); } catch { /* ignore */ }
      }
      const { folderPrefix } = getBucketConfig();
      const cloud_storage_path = `${folderPrefix}videos/${Date.now()}-${v.id}-subs.mp4`;
      await uploadFromFile(outputLocal, cloud_storage_path, 'video/mp4');

      const subtitlesConfig = JSON.stringify({ lines, fontFamily: dto.fontFamily, fontSize, color, strokeColor, position });
      const updated = await this.prisma.video.update({
        where: { id },
        data: { videoSubtitlesPath: cloud_storage_path, subtitlesConfig },
      });
      const videoSubtitlesUrl = await getFileUrl(cloud_storage_path, false);
      const videoUrl = updated.videoPath ? await getFileUrl(updated.videoPath, false) : null;
      return { ...updated, videoUrl, videoSubtitlesUrl };
    } catch (e: any) {
      this.logger.error(`addSubtitles failed: ${e?.message}`);
      throw new BadRequestException(e?.message || 'No se pudieron añadir subtítulos');
    } finally {
      await this.ffmpeg.safeUnlink(inputLocal);
      await this.ffmpeg.safeUnlink(outputLocal);
    }
  }

  async remove(id: string) {
    const v = await this.prisma.video.findUnique({ where: { id } });
    if (!v) throw new NotFoundException('Video no encontrado');
    if (v.videoPath) { try { await deleteFile(v.videoPath); } catch { /* ignore */ } }
    if (v.videoSubtitlesPath) { try { await deleteFile(v.videoSubtitlesPath); } catch { /* ignore */ } }
    if (v.audioPath) { try { await deleteFile(v.audioPath); } catch { /* ignore */ } }
    await this.prisma.video.delete({ where: { id } });
    return { success: true };
  }

  async generate(dto: GenerateVideoDto) {
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

    // Fire-and-forget the heavy work so the HTTP response returns immediately.
    // The frontend polls /api/videos/:id for status updates.
    this.processVideoAsync(video.id, dto, tentativeStart, tentativeEnd, useAuto).catch((e: any) => {
      this.logger.error(`Background video processing crashed: ${e?.message}`);
    });

    return { ...video, videoUrl: null };
  }

  private async processVideoAsync(
    videoId: string,
    dto: GenerateVideoDto,
    tentativeStart: number,
    tentativeEnd: number,
    useAuto: boolean,
  ) {
    let localAudio: string | undefined;
    let localVideo: string | undefined;
    const video = { id: videoId };
    try {
      localAudio = this.ffmpeg.tmpFile('mp3');
      localVideo = this.ffmpeg.tmpFile('mp4');
      this.logger.log(`Downloading audio: ${dto.audioPath}`);
      await downloadToFile(dto.audioPath, localAudio);

      const audioDur = await this.ffmpeg.probeDuration(localAudio).catch(() => 0);
      if (audioDur > 0 && tentativeStart >= audioDur) {
        throw new BadRequestException('El segmento inicial supera la duración del audio.');
      }

      // Determine final viral segment
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

      // Pixabay clips download fast - use more scenes for better visual variety
      const sceneCount = effDuration >= 50 ? 7 : effDuration >= 35 ? 6 : effDuration >= 20 ? 5 : 4;
      const canvasW = dto.format === 'vertical' ? 1080 : 1920;
      const canvasH = dto.format === 'vertical' ? 1920 : 1080;

      // **PRIMARY: Use Pixabay + Pexels stock video clips with LLM-driven cinematic search**
      let clipPaths: string[] = [];
      const downloadedClips: string[] = [];

      try {
        const variation = Date.now() % 100;
        this.logger.log(`\n🎬 Selecting ${sceneCount} cinematic clips coherent with lyrics...`);

        // The clip selection service uses LLM to analyze lyrics and generate targeted search queries
        const clips = await this.clipSelection.selectClips(
          `${dto.title || ''}\n${dto.lyricsText || ''}`,
          sceneCount,
          canvasW,
          canvasH,
          variation,
        );
        this.logger.log(`Found ${clips.length} clips: ${clips.map((c) => `${c.source}:"${c.query}":${c.video.id}`).join(', ')}`);

        for (const c of clips) {
          try {
            const downloader = c.source === 'pixabay' ? this.pixabay : this.pexels;
            const fileUrl = c.source === 'pixabay' ? (c.file as any).url : (c.file as any).link;
            const local = await downloader.downloadToFile(fileUrl, 'mp4');
            downloadedClips.push(local);
            clipPaths.push(local);
            this.logger.log(`📥 Downloaded clip ${clipPaths.length}/${sceneCount} from ${c.source}: "${c.query}"`);
          } catch (e: any) {
            this.logger.error(`Failed to download clip ${c.source}:${c.video.id}: ${e?.message}`);
          }
        }

        if (clipPaths.length >= 2) {
          this.logger.log(`\n✨ SUCCESS: Downloaded ${clipPaths.length} cinematic clips`);
        }
      } catch (e: any) {
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
        } else {
          // Fallback: image-based scenes
          this.logger.warn('Falling back to image scenes (Pexels unavailable)');
          const sceneAssets = await this.sceneSelection.selectScenes(dto.lyricsText || dto.title || '', sceneCount);
          const scenePaths = sceneAssets.map((s) => getSceneFilePath(s.file)).filter((p) => fs.existsSync(p));
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
      } finally {
        // Always clean up downloaded clips
        for (const p of downloadedClips) { await this.ffmpeg.safeUnlink(p); }
      }

      const { folderPrefix } = getBucketConfig();
      const cloud_storage_path = `${folderPrefix}videos/${Date.now()}-${video.id}.mp4`;
      await uploadFromFile(localVideo, cloud_storage_path, 'video/mp4');

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
    } catch (e: any) {
      this.logger.error(`Background generate video failed: ${e?.message}`);
      try {
        await this.prisma.video.update({
          where: { id: video.id },
          data: { status: 'failed', errorMsg: (e?.message ?? 'Error desconocido').slice(0, 500) },
        });
      } catch (e2: any) {
        this.logger.error(`Failed to mark video as failed: ${e2?.message}`);
      }
    } finally {
      await this.ffmpeg.safeUnlink(localAudio);
      await this.ffmpeg.safeUnlink(localVideo);
    }
  }
}
