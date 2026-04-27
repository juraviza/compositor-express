import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class AudioAnalysisService {
  private readonly logger = new Logger(AudioAnalysisService.name);

  /** Probe duration of an audio file in seconds. */
  private probeDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const proc = spawn('ffprobe', [
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

  /**
   * Run a single ffmpeg pass that segments audio into ~3s chunks via asetnsamples
   * and prints per-chunk RMS_level via ametadata=print.
   * Returns array of { t, rms } sorted by time.
   */
  private rmsPerChunk(filePath: string, chunkSeconds = 3): Promise<{ t: number; rms: number }[]> {
    return new Promise((resolve, reject) => {
      // 44100 samples/sec * chunkSeconds
      const nSamples = Math.max(1024, Math.floor(44100 * chunkSeconds));
      const args = [
        '-hide_banner', '-nostats', '-i', filePath,
        '-vn',
        '-af', `aresample=44100,asetnsamples=n=${nSamples}:p=0,astats=metadata=1:reset=1:measure_perchannel=none,ametadata=mode=print:key=lavfi.astats.Overall.RMS_level`,
        '-f', 'null', '-',
      ];
      const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let buf = '';
      proc.stdout.on('data', (d) => { buf += d.toString(); });
      proc.stderr.on('data', (d) => { /* ametadata=print also writes to stdout via -; logs to stderr */ });
      proc.on('close', () => {
        const points: { t: number; rms: number }[] = [];
        // Output is repeating blocks like:
        // frame:NNNN pts:XXXX pts_time:1.234567
        // lavfi.astats.Overall.RMS_level=-12.345
        const lines = buf.split(/\r?\n/);
        let curT: number | null = null;
        for (const line of lines) {
          const tMatch = line.match(/pts_time:([0-9.]+)/);
          if (tMatch) { curT = parseFloat(tMatch[1]); continue; }
          const rMatch = line.match(/lavfi\.astats\.Overall\.RMS_level=(-?[0-9.]+|-?inf)/);
          if (rMatch && curT !== null) {
            const v = rMatch[1] === '-inf' || rMatch[1] === 'inf' ? -100 : parseFloat(rMatch[1]);
            if (isFinite(v)) points.push({ t: curT, rms: v });
            curT = null;
          }
        }
        resolve(points);
      });
      proc.on('error', reject);
    });
  }

  /**
   * Find the most energetic 60-second window in the audio file.
   * Returns segmentStart in seconds.
   */
  async findViralSegment(filePath: string, windowSeconds = 60): Promise<{ start: number; end: number; duration: number }> {
    const total = await this.probeDuration(filePath).catch(() => 0);
    if (!total || total <= windowSeconds + 5) {
      const dur = Math.max(5, Math.min(windowSeconds, total || windowSeconds));
      return { start: 0, end: dur, duration: dur };
    }

    let points: { t: number; rms: number }[] = [];
    try {
      points = await this.rmsPerChunk(filePath, 3);
    } catch (e: any) {
      this.logger.warn(`Audio analysis failed, falling back to mid-point: ${e?.message}`);
    }

    if (points.length < 5) {
      // Fallback: pick a window 1/3 into the song (most pop songs have hook by then)
      const start = Math.max(0, Math.min(total - windowSeconds, total * 0.33));
      return { start, end: start + windowSeconds, duration: windowSeconds };
    }

    // Slide a window summing RMS values whose timestamps fall inside it.
    // RMS is in dBFS (negative). Higher (closer to 0) = louder. We want max sum of energy.
    // Convert dB to linear amplitude for fair averaging.
    const energyPoints = points.map(p => ({ t: p.t, e: Math.pow(10, p.rms / 20) }));

    let bestSum = -Infinity;
    let bestStart = 0;
    // Try window starts every 1.5s
    const stepSec = 1.5;
    const maxStart = total - windowSeconds;
    for (let s = 0; s <= maxStart; s += stepSec) {
      const end = s + windowSeconds;
      let sum = 0;
      for (const p of energyPoints) {
        if (p.t >= s && p.t < end) sum += p.e;
      }
      // Slight bias against the very first 10s (intros tend to be quieter but this helps avoid silence)
      // and against the last 10s (outros)
      const earlyPenalty = s < 10 ? 0.85 : 1;
      const latePenalty = s > total - windowSeconds - 10 ? 0.92 : 1;
      const score = sum * earlyPenalty * latePenalty;
      if (score > bestSum) { bestSum = score; bestStart = s; }
    }
    const start = Math.max(0, Math.min(maxStart, bestStart));
    this.logger.log(`Viral segment auto-detected: ${start.toFixed(1)}s - ${(start + windowSeconds).toFixed(1)}s (audio dur=${total.toFixed(1)}s)`);
    return { start, end: start + windowSeconds, duration: windowSeconds };
  }
}
