import { Injectable, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TEMPLATES, TemplateId } from './templates';
import { TitleFontType } from './dto';

// Try to load ffmpeg/ffprobe from installers, fallback to PATH
// CRITICAL: Ensure execute permissions on production (EACCES fix)
let FFMPEG_PATH: string;
let FFPROBE_PATH: string;

function ensureExecutable(binPath: string): string {
  try {
    fs.chmodSync(binPath, 0o755);
  } catch {
    // Ignore permission errors - may already be executable
  }
  return binPath;
}

try {
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  FFMPEG_PATH = ensureExecutable(ffmpegInstaller.path);
} catch {
  FFMPEG_PATH = 'ffmpeg';
}

try {
  const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
  FFPROBE_PATH = ensureExecutable(ffprobeInstaller.path);
} catch {
  FFPROBE_PATH = 'ffprobe';
}

export type Format = 'vertical' | 'horizontal';

export interface MusicVideoParams {
  audioLocalPath: string;
  outputPath: string;
  format: Format;
  template: TemplateId;
  segmentStart: number;
  segmentEnd: number;
  /** Local file paths (jpg/png) of scene images, in display order. 5-10 recommended. */
  scenes: string[];
  /** Video title to display at top */
  title?: string;
  /** Font for the title */
  titleFont?: TitleFontType;
}

// Find logo file by trying multiple possible locations
function findLogoPath(): string | null {
  const candidates = [
    path.join(__dirname, 'logo-aureo.png'),
    path.join(__dirname, '..', 'logo-aureo.png'),
    path.join(__dirname, '../../public/logo-aureo.png'),
    path.join(__dirname, '../../../public/logo-aureo.png'),
    path.join(__dirname, '../public/logo-aureo.png'),
    path.join(process.cwd(), 'public/logo-aureo.png'),
    path.join(process.cwd(), 'dist/public/logo-aureo.png'),
    path.join(process.cwd(), 'src/logo-aureo.png'),
    '/opt/hostedapp/node/root/nodejs/.build/standalone/public/logo-aureo.png',
    '/opt/hostedapp/node/root/nodejs/.build/standalone/app/public/logo-aureo.png',
  ];
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c; } catch {}
  }
  return null;
}

// Map font name to file path
function findFontPath(fontName: TitleFontType | undefined): string {
  if (!fontName || fontName === 'DejaVuSans-Bold') {
    return '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  }
  
  // Map friendly names to file names
  const fontFileMap: Record<string, string> = {
    'Hunters': 'Hunters.otf',
    'Blacksword': 'Blacksword.otf',
    'Hello Valentina': 'HelloValentina.ttf',
    'Cream Cake': 'CreamCake.otf',
    'Cream Cake Bold': 'CreamCakeBold.otf',
    'BillionDreams': 'BillionDreams_PERSONAL.ttf',
  };

  const fileName = fontFileMap[fontName];
  if (!fileName) return '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

  const candidates = [
    path.join(__dirname, fileName),
    path.join(__dirname, '..', fileName),
    path.join(process.cwd(), `src/${fileName}`),
    path.join(process.cwd(), `dist/src/${fileName}`),
    `/opt/hostedapp/node/root/nodejs/.build/standalone/app/src/${fileName}`,
    `/opt/hostedapp/node/root/nodejs/.build/standalone/src/${fileName}`,
  ];

  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c; } catch {}
  }
  return '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
}

@Injectable()
export class FfmpegService {
  private readonly logger = new Logger(FfmpegService.name);
  private readonly logoPath: string | null = findLogoPath();

  /** Color-grade filter chain per template (pure cinematic; no text). */
  private gradeForTemplate(t: TemplateId): string {
    switch (t) {
      case 'pasion':
        // Warm, red-boosted, contrasty
        return 'eq=saturation=1.20:contrast=1.08:gamma_r=1.08:gamma_g=0.95:gamma_b=0.88';
      case 'noche':
        // Cool, moody blue, slight desaturation
        return 'eq=saturation=0.95:contrast=1.05:gamma_r=0.88:gamma_g=0.95:gamma_b=1.12';
      case 'duende':
        // Sepia-cinematic
        return 'colorchannelmixer=.40:.70:.18:0:.34:.65:.17:0:.27:.53:.14:0,eq=saturation=0.90:contrast=1.10';
      case 'fiesta':
        // Vibrant, punchy
        return 'eq=saturation=1.35:contrast=1.10:brightness=0.02';
      default:
        return 'eq=saturation=1.10:contrast=1.05';
    }
  }

  /** Choose a list of simple fade transitions (compatible with all ffmpeg builds). */
  private pickTransitions(n: number): string[] {
    // Use only 'fade' which is universally available in ffmpeg
    // Alternate between 'fade' for reliable compatibility
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push('fade');
    return out;
  }

  /** Build Ken Burns expression for image i, alternating zoom in/out and pan direction. */
  private kenBurns(i: number, frames: number): { z: string; x: string; y: string } {
    // Alternate zoom in vs zoom out
    const zoomIn = i % 2 === 0;
    // Slow zoom from 1.0 -> 1.18 (in) or 1.18 -> 1.0 (out)
    const z = zoomIn
      ? `min(1+0.18*on/${frames},1.18)`
      : `max(1.18-0.18*on/${frames},1.0)`;
    // Vary pan: 4 patterns based on i mod 4
    const dir = i % 4;
    let x = 'iw/2-(iw/zoom/2)';
    let y = 'ih/2-(ih/zoom/2)';
    if (dir === 1) {
      // pan left to right
      x = `(iw-iw/zoom)*on/${frames}`;
      y = 'ih/2-(ih/zoom/2)';
    } else if (dir === 2) {
      // pan top to bottom
      x = 'iw/2-(iw/zoom/2)';
      y = `(ih-ih/zoom)*on/${frames}`;
    } else if (dir === 3) {
      // diagonal
      x = `(iw-iw/zoom)*on/${frames}`;
      y = `(ih-ih/zoom)*on/${frames}`;
    }
    return { z, x, y };
  }

  /**
   * Build a music video from real video clips (e.g. Pexels stock).
   * Each clip is trimmed to clipDuration, scaled+cropped to the canvas, color-graded,
   * concatenated simply (no xfade), and mixed with the user's audio.
   */
  async generateMusicVideoFromClips(params: {
    audioLocalPath: string;
    outputPath: string;
    format: Format;
    template: TemplateId;
    segmentStart: number;
    segmentEnd: number;
    /** Local mp4 paths (trimmed cleanly from middle works best) */
    clips: string[];
    /** Video title to display at top */
    title?: string;
    /** Font for the title */
    titleFont?: TitleFontType;
  }): Promise<void> {
    const { audioLocalPath, outputPath, format, template, segmentStart, segmentEnd, clips, title, titleFont } = params;
    if (!clips || clips.length < 2) throw new Error('Se requieren al menos 2 clips de video.');

    const totalDur = Math.max(8, Math.min(60, segmentEnd - segmentStart));
    const width = format === 'vertical' ? 1080 : 1920;
    const height = format === 'vertical' ? 1920 : 1080;
    const fps = 30;
    const n = clips.length;
    // Simple distribution: divide total duration by number of clips
    const clipDur = totalDur / n;
    const grade = this.gradeForTemplate(template);

    const args: string[] = ['-y'];
    // For each clip, loop and take clipDur seconds
    for (const c of clips) {
      args.push('-stream_loop', '-1', '-t', clipDur.toFixed(3), '-i', c);
    }
    args.push('-ss', segmentStart.toFixed(3), '-t', totalDur.toFixed(3), '-i', audioLocalPath);
    // Add logo image only if available
    const hasLogo = !!this.logoPath;
    if (hasLogo) args.push('-i', this.logoPath as string);

    const filters: string[] = [];
    for (let i = 0; i < n; i++) {
      // Scale+crop+grade each clip
      filters.push(
        `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},` +
        `${grade},setsar=1,fps=${fps},setpts=PTS-STARTPTS,format=yuv420p[v${i}]`,
      );
    }

    // Simple concat without transitions
    const concatInputs = Array.from({ length: n }, (_, i) => `[v${i}]`).join('');
    filters.push(`${concatInputs}concat=n=${n}:v=1:a=0[v]`);

    // Add vignette and sharpening
    filters.push('[v]vignette=PI/4,unsharp=lx=3:ly=3:la=0.25,format=yuv420p[vg]');

    let lastLabel = 'vg';

    // Add title text at top
    if (title) {
      const escapedTitle = this.escapeDrawText(title);
      const fontSize = format === 'vertical' ? 72 : 96;
      const titleY = format === 'vertical' ? 80 : 60;
      const fontPath = findFontPath(titleFont);
      filters.push(
        `[${lastLabel}]drawtext=` +
        `text='${escapedTitle}':` +
        `fontfile='${fontPath}':` +
        `fontsize=${fontSize}:` +
        `fontcolor=white:` +
        `x=(w-text_w)/2:` +
        `y=${titleY}:` +
        `shadowcolor=black@0.5:shadowx=2:shadowy=2[vt]`
      );
      lastLabel = 'vt';
    }

    // Add logo overlay at bottom
    if (hasLogo) {
      const logoScale = format === 'vertical' ? 400 : 500;
      const logoY = height - logoScale - 10;
      filters.push(
        `[${n + 1}:v]scale=${logoScale}:-1[logo_scaled];` +
        `[${lastLabel}][logo_scaled]overlay=x=(W-w)/2:y=${logoY}:format=auto[final]`
      );
      lastLabel = 'final';
    }

    args.push(
      '-filter_complex', filters.join(';'),
      '-map', `[${lastLabel}]`,
      '-map', `${n}:a`,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '22',
      '-pix_fmt', 'yuv420p',
      '-r', String(fps),
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      '-t', totalDur.toFixed(3),
      '-movflags', '+faststart',
      outputPath,
    );

    this.logger.log(`ffmpeg music video (clips): ${n} clips, ${totalDur.toFixed(1)}s, ${format}, template=${template}, title='${title}', logo=${this.logoPath ?? 'NONE'} -> ${outputPath}`);
    await this.runFfmpeg(args);
  }

  async generateMusicVideo(params: MusicVideoParams): Promise<void> {
    const { audioLocalPath, outputPath, format, template, segmentStart, segmentEnd, scenes, title, titleFont } = params;
    if (!scenes || scenes.length < 2) throw new Error('Se requieren al menos 2 imágenes para el video musical.');

    const totalDur = Math.max(8, Math.min(60, segmentEnd - segmentStart));
    const width = format === 'vertical' ? 1080 : 1920;
    const height = format === 'vertical' ? 1920 : 1080;
    const fps = 30;
    const n = scenes.length;
    // Simple distribution: divide total duration by number of images
    const imgDur = totalDur / n;
    const imgFrames = Math.round(imgDur * fps);
    const grade = this.gradeForTemplate(template);

    // Build inputs: each image looped for imgDur, then audio
    const args: string[] = ['-y'];
    for (const img of scenes) {
      args.push('-loop', '1', '-t', imgDur.toFixed(3), '-i', img);
    }
    args.push('-ss', segmentStart.toFixed(3), '-t', totalDur.toFixed(3), '-i', audioLocalPath);
    // Add logo image only if available
    const hasLogo = !!this.logoPath;
    if (hasLogo) args.push('-i', this.logoPath as string);

    // Build filter graph
    const filters: string[] = [];
    // Slightly oversize crop area so Ken Burns has room to pan
    const padW = Math.round(width * 1.4);
    const padH = Math.round(height * 1.4);
    for (let i = 0; i < n; i++) {
      const { z, x, y } = this.kenBurns(i, imgFrames);
      filters.push(
        `[${i}:v]scale=${padW}:${padH}:force_original_aspect_ratio=increase,crop=${padW}:${padH},` +
        `zoompan=z='${z}':x='${x}':y='${y}':d=${imgFrames}:s=${width}x${height}:fps=${fps},` +
        `setsar=1,format=yuv420p[v${i}]`,
      );
    }

    // Simple concat without transitions
    const concatInputs = Array.from({ length: n }, (_, i) => `[v${i}]`).join('');
    filters.push(`${concatInputs}concat=n=${n}:v=1:a=0[vconcat]`);

    // Final color grade + vignette + subtle sharpening for cinematic look
    filters.push(
      `[vconcat]${grade},vignette=PI/4,unsharp=lx=3:ly=3:la=0.35,format=yuv420p[vg]`,
    );

    let lastLabel = 'vg';

    // Add title text at top
    if (title) {
      const escapedTitle = this.escapeDrawText(title);
      const fontSize = format === 'vertical' ? 72 : 96;
      const titleY = format === 'vertical' ? 80 : 60;
      const fontPath = findFontPath(titleFont);
      filters.push(
        `[${lastLabel}]drawtext=` +
        `text='${escapedTitle}':` +
        `fontfile='${fontPath}':` +
        `fontsize=${fontSize}:` +
        `fontcolor=white:` +
        `x=(w-text_w)/2:` +
        `y=${titleY}:` +
        `shadowcolor=black@0.5:shadowx=2:shadowy=2[vt]`
      );
      lastLabel = 'vt';
    }

    // Add logo overlay at bottom
    if (hasLogo) {
      const logoScale = format === 'vertical' ? 400 : 500;
      const logoY = height - logoScale - 10;
      filters.push(
        `[${n + 1}:v]scale=${logoScale}:-1[logo_scaled];` +
        `[${lastLabel}][logo_scaled]overlay=x=(W-w)/2:y=${logoY}:format=auto[final]`
      );
      lastLabel = 'final';
    }

    const filterComplex = filters.join(';');
    args.push(
      '-filter_complex', filterComplex,
      '-map', `[${lastLabel}]`,
      '-map', `${n}:a`,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '22',
      '-pix_fmt', 'yuv420p',
      '-r', String(fps),
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      '-t', totalDur.toFixed(3),
      '-movflags', '+faststart',
      outputPath,
    );

    this.logger.log(`ffmpeg music video: ${n} scenes, ${totalDur.toFixed(1)}s, ${format}, template=${template}, title='${title}', logo=${this.logoPath ?? 'NONE'} -> ${outputPath}`);
    await this.runFfmpeg(args);
  }

  /** Escape text for ffmpeg drawtext filter */
  private escapeDrawText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\u2019")
      .replace(/:/g, '\\:')
      .replace(/,/g, '\\,')
      .replace(/%/g, '\\%')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/;/g, '\\;');
  }

  /**
   * Burn timed subtitle lines onto an existing video.
   * Lines are auto-distributed evenly across the video duration if no timing provided.
   */
  async burnSubtitles(params: {
    inputVideoPath: string;
    outputPath: string;
    lines: string[];
    fontPath: string;
    fontSize: number;
    color: string; // hex without '#', e.g. 'FFFFFF'
    strokeColor?: string; // hex, default '000000'
    position: 'top' | 'center' | 'bottom';
  }): Promise<void> {
    const { inputVideoPath, outputPath, lines, fontPath, fontSize, color, strokeColor = '000000', position } = params;
    const cleanLines = (lines || []).map(l => (l ?? '').trim()).filter(l => l.length > 0).slice(0, 24);
    if (cleanLines.length === 0) throw new Error('No hay líneas de subtítulo.');

    // Probe video duration
    const dur = await this.probeDuration(inputVideoPath);
    const total = dur > 0 ? dur : 60;
    const lineDur = total / cleanLines.length;

    // Y position
    let yExpr = 'h*0.78'; // bottom default
    if (position === 'top') yExpr = 'h*0.10';
    else if (position === 'center') yExpr = '(h-text_h)/2';
    else yExpr = 'h*0.78';

    const fadeIn = Math.min(0.4, lineDur * 0.15);
    const fadeOut = Math.min(0.4, lineDur * 0.15);

    const drawtexts = cleanLines.map((line, idx) => {
      const start = idx * lineDur;
      const end = (idx + 1) * lineDur;
      const text = this.escapeDrawText(line);
      const alphaExpr = `if(lt(t,${start.toFixed(3)}),0,if(lt(t,${(start + fadeIn).toFixed(3)}),(t-${start.toFixed(3)})/${fadeIn.toFixed(3)},if(lt(t,${(end - fadeOut).toFixed(3)}),1,if(lt(t,${end.toFixed(3)}),(${end.toFixed(3)}-t)/${fadeOut.toFixed(3)},0))))`;
      const enableExpr = `between(t,${start.toFixed(3)},${end.toFixed(3)})`;
      return `drawtext=fontfile='${fontPath}':text='${text}':fontcolor=0x${color}:fontsize=${fontSize}:x=(w-text_w)/2:y=${yExpr}:borderw=4:bordercolor=0x${strokeColor}:shadowcolor=0x${strokeColor}@0.7:shadowx=2:shadowy=3:alpha='${alphaExpr}':enable='${enableExpr}'`;
    }).join(',');

    const args: string[] = [
      '-y',
      '-i', inputVideoPath,
      '-vf', drawtexts,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '22',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'copy',
      '-movflags', '+faststart',
      outputPath,
    ];

    this.logger.log(`ffmpeg burning ${cleanLines.length} subtitle lines onto ${inputVideoPath}`);
    await this.runFfmpeg(args);
  }

  private runFfmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(FFMPEG_PATH, args, { stdio: ['ignore', 'pipe', 'pipe'] }) as ChildProcess;
      let stderr = '';
      proc.stderr?.on('data', (d: any) => { stderr += d.toString(); });
      proc.on('close', (code: any) => {
        if (code === 0) resolve();
        else {
          this.logger.error(`ffmpeg failed (${code}): ${stderr.slice(-2000)}`);
          reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-500)}`));
        }
      });
      proc.on('error', reject);
    });
  }

  /** Probe the audio file duration in seconds. */
  async probeDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const proc = spawn(FFPROBE_PATH, [
        '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', filePath,
      ]) as ChildProcess;
      let out = '';
      proc.stdout?.on('data', (d: any) => { out += d.toString(); });
      proc.on('close', (code: any) => {
        if (code === 0) {
          const v = parseFloat(out.trim());
          resolve(isFinite(v) ? v : 0);
        } else reject(new Error('ffprobe failed'));
      });
      proc.on('error', reject);
    });
  }

  compositeVideos(params: {
    bgVideoPath: string;
    avatarVideoPath: string;
    audioPath: string;
    outputPath: string;
    format: Format;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const { bgVideoPath, avatarVideoPath, audioPath, outputPath, format } = params;
      const isVertical = format === 'vertical';
      const bgRes = isVertical ? '1080x1920' : '1920x1080';
      const avatarScale = isVertical ? '0.6' : '0.4';
      const avatarX = isVertical ? '(main_w-overlay_w)/2' : 'main_w-overlay_w-30';
      const avatarY = isVertical ? 'main_h-overlay_h-50' : '(main_h-overlay_h)/2';
      const filterComplex = `[0:v]scale=${bgRes}[bg];[1:v]scale=w=iw*${avatarScale}:h=ow/a[avatar];[bg][avatar]overlay=${avatarX}:${avatarY}[out]`;
      const args = ['-i', bgVideoPath, '-i', avatarVideoPath, '-i', audioPath, '-filter_complex', filterComplex, '-map', '[out]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', '-y', outputPath];
      const proc = spawn(FFMPEG_PATH, args);
      let stderr = '';
      proc.stderr.on('data', (d) => (stderr += d.toString()));
      proc.on('close', (code) => { if (code === 0) resolve(); else reject(new Error(`FFmpeg compositing failed: ${stderr}`)); });
      proc.on('error', reject);
    });
  }

  tmpFile(ext: string): string {
    return path.join(os.tmpdir(), `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
  }

  async safeUnlink(p?: string) {
    if (!p) return;
    try { await fs.promises.unlink(p); } catch { /* ignore */ }
  }
}
