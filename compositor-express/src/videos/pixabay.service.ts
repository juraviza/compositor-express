import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import * as os from 'os';

export interface PixabayVideoFile {
  url: string;
  width: number;
  height: number;
  size: number;
  thumbnail: string;
}

export interface PixabayVideoFiles {
  large?: PixabayVideoFile;
  medium?: PixabayVideoFile;
  small?: PixabayVideoFile;
  tiny?: PixabayVideoFile;
}

export interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  videos: PixabayVideoFiles;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

@Injectable()
export class PixabayService {
  private readonly logger = new Logger(PixabayService.name);
  private readonly apiKey = process.env.PIXABAY_API_KEY || '';

  async search(
    query: string,
    opts: {
      lang?: string;
      videoType?: 'all' | 'film' | 'animation';
      category?: string;
      minWidth?: number;
      minHeight?: number;
      order?: 'popular' | 'latest';
      perPage?: number;
      page?: number;
    } = {},
  ): Promise<PixabayVideo[]> {
    if (!this.apiKey) {
      this.logger.warn('PIXABAY_API_KEY missing');
      return [];
    }

    const params = new URLSearchParams();
    params.set('key', this.apiKey);
    params.set('q', query);
    params.set('lang', opts.lang || 'es');
    params.set('video_type', opts.videoType || 'all');
    if (opts.category) params.set('category', opts.category);
    if (opts.minWidth) params.set('min_width', String(opts.minWidth));
    if (opts.minHeight) params.set('min_height', String(opts.minHeight));
    params.set('order', opts.order || 'popular');
    params.set('per_page', String(opts.perPage || 20));
    params.set('page', String(opts.page || 1));

    const url = `https://pixabay.com/api/videos/?${params.toString()}`;

    return new Promise((resolve) => {
      const req = https.get(url, (res) => {
        let buf = '';
        res.on('data', (c) => {
          buf += c.toString();
        });
        res.on('end', () => {
          try {
            const data = JSON.parse(buf || '{}');
            const list = Array.isArray(data?.hits) ? data.hits : [];
            resolve(list as PixabayVideo[]);
          } catch (e: any) {
            this.logger.warn(`Pixabay parse error for "${query}": ${e?.message}`);
            resolve([]);
          }
        });
      });
      req.on('error', (e) => {
        this.logger.warn(`Pixabay request error: ${e.message}`);
        resolve([]);
      });
      req.setTimeout(15000, () => {
        req.destroy();
        resolve([]);
      });
    });
  }

  pickBestFile(video: PixabayVideo, targetWidth: number, targetHeight: number): PixabayVideoFile | null {
    const wantPortrait = targetHeight > targetWidth;
    const allFiles = [
      video.videos?.large,
      video.videos?.medium,
      video.videos?.small,
      video.videos?.tiny,
    ].filter((f): f is PixabayVideoFile => !!f && !!f.url && f.width > 0 && f.height > 0);

    if (allFiles.length === 0) return null;

    const scored = allFiles.map((f) => {
      const isPortrait = f.height > f.width;
      const orientOK = wantPortrait === isPortrait ? 0 : 200;
      const minTarget = Math.min(targetWidth, targetHeight);
      const minF = Math.min(f.width, f.height);
      const tooSmall = minF < minTarget ? (minTarget - minF) * 2 : 0;
      const tooBig = minF > minTarget * 1.6 ? minF - minTarget * 1.6 : 0;
      return { f, score: orientOK + tooSmall + tooBig };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored[0]?.f ?? allFiles[0];
  }

  downloadToFile(url: string, ext = 'mp4'): Promise<string> {
    return new Promise((resolve, reject) => {
      const filePath = path.join(os.tmpdir(), `pixabay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
      const file = fs.createWriteStream(filePath);
      const handle = (u: string, redirects = 0) => {
        if (redirects > 5) {
          reject(new Error('Too many redirects'));
          return;
        }
        https
          .get(u, (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              handle(res.headers.location, redirects + 1);
              return;
            }
            if (res.statusCode !== 200) {
              reject(new Error(`Download failed ${res.statusCode}`));
              return;
            }
            res.pipe(file);
            file.on('finish', () => file.close(() => resolve(filePath)));
          })
          .on('error', (e) => {
            try {
              fs.unlinkSync(filePath);
            } catch {}
            reject(e);
          });
      };
      handle(url);
    });
  }
}
