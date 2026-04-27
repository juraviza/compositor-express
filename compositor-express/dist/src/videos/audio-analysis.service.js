"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AudioAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
let AudioAnalysisService = AudioAnalysisService_1 = class AudioAnalysisService {
    logger = new common_1.Logger(AudioAnalysisService_1.name);
    probeDuration(filePath) {
        return new Promise((resolve, reject) => {
            const proc = (0, child_process_1.spawn)('ffprobe', [
                '-v', 'error', '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1', filePath,
            ]);
            let out = '';
            proc.stdout.on('data', (d) => { out += d.toString(); });
            proc.on('close', () => {
                const v = parseFloat(out.trim());
                resolve(isFinite(v) ? v : 0);
            });
            proc.on('error', reject);
        });
    }
    rmsPerChunk(filePath, chunkSeconds = 3) {
        return new Promise((resolve, reject) => {
            const nSamples = Math.max(1024, Math.floor(44100 * chunkSeconds));
            const args = [
                '-hide_banner', '-nostats', '-i', filePath,
                '-vn',
                '-af', `aresample=44100,asetnsamples=n=${nSamples}:p=0,astats=metadata=1:reset=1:measure_perchannel=none,ametadata=mode=print:key=lavfi.astats.Overall.RMS_level`,
                '-f', 'null', '-',
            ];
            const proc = (0, child_process_1.spawn)('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
            let buf = '';
            proc.stdout.on('data', (d) => { buf += d.toString(); });
            proc.stderr.on('data', (d) => { });
            proc.on('close', () => {
                const points = [];
                const lines = buf.split(/\r?\n/);
                let curT = null;
                for (const line of lines) {
                    const tMatch = line.match(/pts_time:([0-9.]+)/);
                    if (tMatch) {
                        curT = parseFloat(tMatch[1]);
                        continue;
                    }
                    const rMatch = line.match(/lavfi\.astats\.Overall\.RMS_level=(-?[0-9.]+|-?inf)/);
                    if (rMatch && curT !== null) {
                        const v = rMatch[1] === '-inf' || rMatch[1] === 'inf' ? -100 : parseFloat(rMatch[1]);
                        if (isFinite(v))
                            points.push({ t: curT, rms: v });
                        curT = null;
                    }
                }
                resolve(points);
            });
            proc.on('error', reject);
        });
    }
    async findViralSegment(filePath, windowSeconds = 60) {
        const total = await this.probeDuration(filePath).catch(() => 0);
        if (!total || total <= windowSeconds + 5) {
            const dur = Math.max(5, Math.min(windowSeconds, total || windowSeconds));
            return { start: 0, end: dur, duration: dur };
        }
        let points = [];
        try {
            points = await this.rmsPerChunk(filePath, 3);
        }
        catch (e) {
            this.logger.warn(`Audio analysis failed, falling back to mid-point: ${e?.message}`);
        }
        if (points.length < 5) {
            const start = Math.max(0, Math.min(total - windowSeconds, total * 0.33));
            return { start, end: start + windowSeconds, duration: windowSeconds };
        }
        const energyPoints = points.map(p => ({ t: p.t, e: Math.pow(10, p.rms / 20) }));
        let bestSum = -Infinity;
        let bestStart = 0;
        const stepSec = 1.5;
        const maxStart = total - windowSeconds;
        for (let s = 0; s <= maxStart; s += stepSec) {
            const end = s + windowSeconds;
            let sum = 0;
            for (const p of energyPoints) {
                if (p.t >= s && p.t < end)
                    sum += p.e;
            }
            const earlyPenalty = s < 10 ? 0.85 : 1;
            const latePenalty = s > total - windowSeconds - 10 ? 0.92 : 1;
            const score = sum * earlyPenalty * latePenalty;
            if (score > bestSum) {
                bestSum = score;
                bestStart = s;
            }
        }
        const start = Math.max(0, Math.min(maxStart, bestStart));
        this.logger.log(`Viral segment auto-detected: ${start.toFixed(1)}s - ${(start + windowSeconds).toFixed(1)}s (audio dur=${total.toFixed(1)}s)`);
        return { start, end: start + windowSeconds, duration: windowSeconds };
    }
};
exports.AudioAnalysisService = AudioAnalysisService;
exports.AudioAnalysisService = AudioAnalysisService = AudioAnalysisService_1 = __decorate([
    (0, common_1.Injectable)()
], AudioAnalysisService);
//# sourceMappingURL=audio-analysis.service.js.map