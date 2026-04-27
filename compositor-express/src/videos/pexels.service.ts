import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import * as os from 'os';

export interface PexelsVideoFile {
  id: number;
  quality: string | null;
  width: number;
  height: number;
  link: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number; // seconds
  url: string;
  video_files: PexelsVideoFile[];
}

@Injectable()
export class PexelsService {
  private readonly logger = new Logger(PexelsService.name);
  private readonly apiKey = process.env.PEXELS_API_KEY || '';

  /** Search Pexels videos. Returns up to perPage results. */
  async search(query: string, opts: { orientation?: 'portrait' | 'landscape'; perPage?: number; size?: 'small' | 'medium' | 'large' } = {}): Promise<PexelsVideo[]> {
    if (!this.apiKey) {
      this.logger.warn('PEXELS_API_KEY missing');
      return [];
    }
    const params = new URLSearchParams();
    params.set('query', query);
    params.set('per_page', String(opts.perPage ?? 5));
    if (opts.orientation) params.set('orientation', opts.orientation);
    if (opts.size) params.set('size', opts.size);
    const url = `https://api.pexels.com/videos/search?${params.toString()}`;

    return new Promise((resolve) => {
      const req = https.get(url, { headers: { Authorization: this.apiKey } }, (res) => {
        let buf = '';
        res.on('data', (c) => { buf += c.toString(); });
        res.on('end', () => {
          try {
            const data = JSON.parse(buf || '{}');
            const list = Array.isArray(data?.videos) ? data.videos : [];
            resolve(list as PexelsVideo[]);
          } catch (e: any) {
            this.logger.warn(`Pexels parse error for "${query}": ${e?.message}`);
            resolve([]);
          }
        });
      });
      req.on('error', (e) => { this.logger.warn(`Pexels request error: ${e.message}`); resolve([]); });
      req.setTimeout(15000, () => { req.destroy(); resolve([]); });
    });
  }

  /** Pick the best video file for a target canvas size. Prefer HD, prefer matching orientation. */
  pickBestFile(video: PexelsVideo, targetWidth: number, targetHeight: number): PexelsVideoFile | null {
    const wantPortrait = targetHeight > targetWidth;
    const candidates = (video.video_files || []).filter((f) => f.width && f.height && f.link);
    if (candidates.length === 0) return null;
    // Score: prefer matching orientation, prefer >= target on smaller dim, prefer not too large (<= 1.6x target).
    const scored = candidates.map((f) => {
      const isPortrait = f.height > f.width;
      const orientOK = wantPortrait === isPortrait ? 0 : 200;
      const minTarget = Math.min(targetWidth, targetHeight);
      const minF = Math.min(f.width, f.height);
      const tooSmall = minF < minTarget ? (minTarget - minF) * 2 : 0;
      const tooBig = minF > minTarget * 1.6 ? (minF - minTarget * 1.6) : 0;
      return { f, score: orientOK + tooSmall + tooBig };
    });
    scored.sort((a, b) => a.score - b.score);
    return scored[0]?.f ?? candidates[0];
  }

  /** Download a remote URL to a local temp file. */
  downloadToFile(url: string, ext = 'mp4'): Promise<string> {
    return new Promise((resolve, reject) => {
      const filePath = path.join(os.tmpdir(), `pexels-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
      const file = fs.createWriteStream(filePath);
      const handle = (u: string, redirects = 0) => {
        if (redirects > 5) { reject(new Error('Too many redirects')); return; }
        https.get(u, (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            handle(res.headers.location, redirects + 1);
            return;
          }
          if (res.statusCode !== 200) { reject(new Error(`Download failed ${res.statusCode}`)); return; }
          res.pipe(file);
          file.on('finish', () => file.close(() => resolve(filePath)));
        }).on('error', (e) => { try { fs.unlinkSync(filePath); } catch {} reject(e); });
      };
      handle(url);
    });
  }
}
