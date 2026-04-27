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
var FfmpegService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfmpegService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
let FFMPEG_PATH;
let FFPROBE_PATH;
function ensureExecutable(binPath) {
    try {
        fs.chmodSync(binPath, 0o755);
    }
    catch {
    }
    return binPath;
}
try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    FFMPEG_PATH = ensureExecutable(ffmpegInstaller.path);
}
catch {
    FFMPEG_PATH = 'ffmpeg';
}
try {
    const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
    FFPROBE_PATH = ensureExecutable(ffprobeInstaller.path);
}
catch {
    FFPROBE_PATH = 'ffprobe';
}
function findLogoPath() {
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
        try {
            if (fs.existsSync(c))
                return c;
        }
        catch { }
    }
    return null;
}
function findFontPath(fontName) {
    if (!fontName || fontName === 'DejaVuSans-Bold') {
        return '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
    }
    const fontFileMap = {
        'Hunters': 'Hunters.otf',
        'Blacksword': 'Blacksword.otf',
        'Hello Valentina': 'HelloValentina.ttf',
        'Cream Cake': 'CreamCake.otf',
        'Cream Cake Bold': 'CreamCakeBold.otf',
        'BillionDreams': 'BillionDreams_PERSONAL.ttf',
    };
    const fileName = fontFileMap[fontName];
    if (!fileName)
        return '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
    const candidates = [
        path.join(__dirname, fileName),
        path.join(__dirname, '..', fileName),
        path.join(process.cwd(), `src/${fileName}`),
        path.join(process.cwd(), `dist/src/${fileName}`),
        `/opt/hostedapp/node/root/nodejs/.build/standalone/app/src/${fileName}`,
        `/opt/hostedapp/node/root/nodejs/.build/standalone/src/${fileName}`,
    ];
    for (const c of candidates) {
        try {
            if (fs.existsSync(c))
                return c;
        }
        catch { }
    }
    return '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
}
let FfmpegService = FfmpegService_1 = class FfmpegService {
    logger = new common_1.Logger(FfmpegService_1.name);
    logoPath = findLogoPath();
    gradeForTemplate(t) {
        switch (t) {
            case 'pasion':
                return 'eq=saturation=1.20:contrast=1.08:gamma_r=1.08:gamma_g=0.95:gamma_b=0.88';
            case 'noche':
                return 'eq=saturation=0.95:contrast=1.05:gamma_r=0.88:gamma_g=0.95:gamma_b=1.12';
            case 'duende':
                return 'colorchannelmixer=.40:.70:.18:0:.34:.65:.17:0:.27:.53:.14:0,eq=saturation=0.90:contrast=1.10';
            case 'fiesta':
                return 'eq=saturation=1.35:contrast=1.10:brightness=0.02';
            default:
                return 'eq=saturation=1.10:contrast=1.05';
        }
    }
    pickTransitions(n) {
        const out = [];
        for (let i = 0; i < n; i++)
            out.push('fade');
        return out;
    }
    kenBurns(i, frames) {
        const zoomIn = i % 2 === 0;
        const z = zoomIn
            ? `min(1+0.18*on/${frames},1.18)`
            : `max(1.18-0.18*on/${frames},1.0)`;
        const dir = i % 4;
        let x = 'iw/2-(iw/zoom/2)';
        let y = 'ih/2-(ih/zoom/2)';
        if (dir === 1) {
            x = `(iw-iw/zoom)*on/${frames}`;
            y = 'ih/2-(ih/zoom/2)';
        }
        else if (dir === 2) {
            x = 'iw/2-(iw/zoom/2)';
            y = `(ih-ih/zoom)*on/${frames}`;
        }
        else if (dir === 3) {
            x = `(iw-iw/zoom)*on/${frames}`;
            y = `(ih-ih/zoom)*on/${frames}`;
        }
        return { z, x, y };
    }
    async generateMusicVideoFromClips(params) {
        const { audioLocalPath, outputPath, format, template, segmentStart, segmentEnd, clips, title, titleFont } = params;
        if (!clips || clips.length < 2)
            throw new Error('Se requieren al menos 2 clips de video.');
        const totalDur = Math.max(8, Math.min(60, segmentEnd - segmentStart));
        const width = format === 'vertical' ? 1080 : 1920;
        const height = format === 'vertical' ? 1920 : 1080;
        const fps = 30;
        const n = clips.length;
        const clipDur = totalDur / n;
        const grade = this.gradeForTemplate(template);
        const args = ['-y'];
        for (const c of clips) {
            args.push('-stream_loop', '-1', '-t', clipDur.toFixed(3), '-i', c);
        }
        args.push('-ss', segmentStart.toFixed(3), '-t', totalDur.toFixed(3), '-i', audioLocalPath);
        const hasLogo = !!this.logoPath;
        if (hasLogo)
            args.push('-i', this.logoPath);
        const filters = [];
        for (let i = 0; i < n; i++) {
            filters.push(`[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},` +
                `${grade},setsar=1,fps=${fps},setpts=PTS-STARTPTS,format=yuv420p[v${i}]`);
        }
        const concatInputs = Array.from({ length: n }, (_, i) => `[v${i}]`).join('');
        filters.push(`${concatInputs}concat=n=${n}:v=1:a=0[v]`);
        filters.push('[v]vignette=PI/4,unsharp=lx=3:ly=3:la=0.25,format=yuv420p[vg]');
        let lastLabel = 'vg';
        if (title) {
            const escapedTitle = this.escapeDrawText(title);
            const fontSize = format === 'vertical' ? 72 : 96;
            const titleY = format === 'vertical' ? 80 : 60;
            const fontPath = findFontPath(titleFont);
            filters.push(`[${lastLabel}]drawtext=` +
                `text='${escapedTitle}':` +
                `fontfile='${fontPath}':` +
                `fontsize=${fontSize}:` +
                `fontcolor=white:` +
                `x=(w-text_w)/2:` +
                `y=${titleY}:` +
                `shadowcolor=black@0.5:shadowx=2:shadowy=2[vt]`);
            lastLabel = 'vt';
        }
        if (hasLogo) {
            const logoScale = format === 'vertical' ? 400 : 500;
            const logoY = height - logoScale - 10;
            filters.push(`[${n + 1}:v]scale=${logoScale}:-1[logo_scaled];` +
                `[${lastLabel}][logo_scaled]overlay=x=(W-w)/2:y=${logoY}:format=auto[final]`);
            lastLabel = 'final';
        }
        args.push('-filter_complex', filters.join(';'), '-map', `[${lastLabel}]`, '-map', `${n}:a`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', String(fps), '-c:a', 'aac', '-b:a', '192k', '-shortest', '-t', totalDur.toFixed(3), '-movflags', '+faststart', outputPath);
        this.logger.log(`ffmpeg music video (clips): ${n} clips, ${totalDur.toFixed(1)}s, ${format}, template=${template}, title='${title}', logo=${this.logoPath ?? 'NONE'} -> ${outputPath}`);
        await this.runFfmpeg(args);
    }
    async generateMusicVideo(params) {
        const { audioLocalPath, outputPath, format, template, segmentStart, segmentEnd, scenes, title, titleFont } = params;
        if (!scenes || scenes.length < 2)
            throw new Error('Se requieren al menos 2 imágenes para el video musical.');
        const totalDur = Math.max(8, Math.min(60, segmentEnd - segmentStart));
        const width = format === 'vertical' ? 1080 : 1920;
        const height = format === 'vertical' ? 1920 : 1080;
        const fps = 30;
        const n = scenes.length;
        const imgDur = totalDur / n;
        const imgFrames = Math.round(imgDur * fps);
        const grade = this.gradeForTemplate(template);
        const args = ['-y'];
        for (const img of scenes) {
            args.push('-loop', '1', '-t', imgDur.toFixed(3), '-i', img);
        }
        args.push('-ss', segmentStart.toFixed(3), '-t', totalDur.toFixed(3), '-i', audioLocalPath);
        const hasLogo = !!this.logoPath;
        if (hasLogo)
            args.push('-i', this.logoPath);
        const filters = [];
        const padW = Math.round(width * 1.4);
        const padH = Math.round(height * 1.4);
        for (let i = 0; i < n; i++) {
            const { z, x, y } = this.kenBurns(i, imgFrames);
            filters.push(`[${i}:v]scale=${padW}:${padH}:force_original_aspect_ratio=increase,crop=${padW}:${padH},` +
                `zoompan=z='${z}':x='${x}':y='${y}':d=${imgFrames}:s=${width}x${height}:fps=${fps},` +
                `setsar=1,format=yuv420p[v${i}]`);
        }
        const concatInputs = Array.from({ length: n }, (_, i) => `[v${i}]`).join('');
        filters.push(`${concatInputs}concat=n=${n}:v=1:a=0[vconcat]`);
        filters.push(`[vconcat]${grade},vignette=PI/4,unsharp=lx=3:ly=3:la=0.35,format=yuv420p[vg]`);
        let lastLabel = 'vg';
        if (title) {
            const escapedTitle = this.escapeDrawText(title);
            const fontSize = format === 'vertical' ? 72 : 96;
            const titleY = format === 'vertical' ? 80 : 60;
            const fontPath = findFontPath(titleFont);
            filters.push(`[${lastLabel}]drawtext=` +
                `text='${escapedTitle}':` +
                `fontfile='${fontPath}':` +
                `fontsize=${fontSize}:` +
                `fontcolor=white:` +
                `x=(w-text_w)/2:` +
                `y=${titleY}:` +
                `shadowcolor=black@0.5:shadowx=2:shadowy=2[vt]`);
            lastLabel = 'vt';
        }
        if (hasLogo) {
            const logoScale = format === 'vertical' ? 400 : 500;
            const logoY = height - logoScale - 10;
            filters.push(`[${n + 1}:v]scale=${logoScale}:-1[logo_scaled];` +
                `[${lastLabel}][logo_scaled]overlay=x=(W-w)/2:y=${logoY}:format=auto[final]`);
            lastLabel = 'final';
        }
        const filterComplex = filters.join(';');
        args.push('-filter_complex', filterComplex, '-map', `[${lastLabel}]`, '-map', `${n}:a`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', String(fps), '-c:a', 'aac', '-b:a', '192k', '-shortest', '-t', totalDur.toFixed(3), '-movflags', '+faststart', outputPath);
        this.logger.log(`ffmpeg music video: ${n} scenes, ${totalDur.toFixed(1)}s, ${format}, template=${template}, title='${title}', logo=${this.logoPath ?? 'NONE'} -> ${outputPath}`);
        await this.runFfmpeg(args);
    }
    escapeDrawText(text) {
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
    async burnSubtitles(params) {
        const { inputVideoPath, outputPath, lines, fontPath, fontSize, color, strokeColor = '000000', position } = params;
        const cleanLines = (lines || []).map(l => (l ?? '').trim()).filter(l => l.length > 0).slice(0, 24);
        if (cleanLines.length === 0)
            throw new Error('No hay líneas de subtítulo.');
        const dur = await this.probeDuration(inputVideoPath);
        const total = dur > 0 ? dur : 60;
        const lineDur = total / cleanLines.length;
        let yExpr = 'h*0.78';
        if (position === 'top')
            yExpr = 'h*0.10';
        else if (position === 'center')
            yExpr = '(h-text_h)/2';
        else
            yExpr = 'h*0.78';
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
        const args = [
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
    runFfmpeg(args) {
        return new Promise((resolve, reject) => {
            const proc = (0, child_process_1.spawn)(FFMPEG_PATH, args, { stdio: ['ignore', 'pipe', 'pipe'] });
            let stderr = '';
            proc.stderr?.on('data', (d) => { stderr += d.toString(); });
            proc.on('close', (code) => {
                if (code === 0)
                    resolve();
                else {
                    this.logger.error(`ffmpeg failed (${code}): ${stderr.slice(-2000)}`);
                    reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-500)}`));
                }
            });
            proc.on('error', reject);
        });
    }
    async probeDuration(filePath) {
        return new Promise((resolve, reject) => {
            const proc = (0, child_process_1.spawn)(FFPROBE_PATH, [
                '-v', 'error', '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1', filePath,
            ]);
            let out = '';
            proc.stdout?.on('data', (d) => { out += d.toString(); });
            proc.on('close', (code) => {
                if (code === 0) {
                    const v = parseFloat(out.trim());
                    resolve(isFinite(v) ? v : 0);
                }
                else
                    reject(new Error('ffprobe failed'));
            });
            proc.on('error', reject);
        });
    }
    compositeVideos(params) {
        return new Promise((resolve, reject) => {
            const { bgVideoPath, avatarVideoPath, audioPath, outputPath, format } = params;
            const isVertical = format === 'vertical';
            const bgRes = isVertical ? '1080x1920' : '1920x1080';
            const avatarScale = isVertical ? '0.6' : '0.4';
            const avatarX = isVertical ? '(main_w-overlay_w)/2' : 'main_w-overlay_w-30';
            const avatarY = isVertical ? 'main_h-overlay_h-50' : '(main_h-overlay_h)/2';
            const filterComplex = `[0:v]scale=${bgRes}[bg];[1:v]scale=w=iw*${avatarScale}:h=ow/a[avatar];[bg][avatar]overlay=${avatarX}:${avatarY}[out]`;
            const args = ['-i', bgVideoPath, '-i', avatarVideoPath, '-i', audioPath, '-filter_complex', filterComplex, '-map', '[out]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', '-y', outputPath];
            const proc = (0, child_process_1.spawn)(FFMPEG_PATH, args);
            let stderr = '';
            proc.stderr.on('data', (d) => (stderr += d.toString()));
            proc.on('close', (code) => { if (code === 0)
                resolve();
            else
                reject(new Error(`FFmpeg compositing failed: ${stderr}`)); });
            proc.on('error', reject);
        });
    }
    tmpFile(ext) {
        return path.join(os.tmpdir(), `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
    }
    async safeUnlink(p) {
        if (!p)
            return;
        try {
            await fs.promises.unlink(p);
        }
        catch { }
    }
};
exports.FfmpegService = FfmpegService;
exports.FfmpegService = FfmpegService = FfmpegService_1 = __decorate([
    (0, common_1.Injectable)()
], FfmpegService);
//# sourceMappingURL=ffmpeg.service.js.map