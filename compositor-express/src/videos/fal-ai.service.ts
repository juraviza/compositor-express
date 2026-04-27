import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class FalAiService {
  private readonly logger = new Logger(FalAiService.name);
  private readonly apiKey = process.env.FAL_API_KEY || '';
  // Kling 1.6 Standard - good quality / cost balance, supports 5s and 10s videos
  private readonly model = 'fal-ai/kling-video/v1.6/standard/text-to-video';

  /**
   * Generate a cinematic video using Fal.ai Kling Video model via the queue API.
   * Returns the public video URL once the queue completes.
   */
  async generateVideo(
    prompt: string,
    duration: number = 5,
    _numFrames: number = 60,
    aspectRatio: '16:9' | '9:16' | '1:1' = '16:9',
  ): Promise<{ videoUrl: string; seed: number } | null> {
    if (!this.apiKey) {
      this.logger.warn('FAL_API_KEY missing');
      return null;
    }

    // Kling supports only "5" or "10" seconds
    const dur = duration >= 8 ? '10' : '5';

    const payload = {
      prompt,
      duration: dur,
      aspect_ratio: aspectRatio,
      negative_prompt: 'blur, distort, low quality, watermark, text, deformed, ugly, cartoon',
      cfg_scale: 0.7,
    };

    this.logger.log(`🎬 Submitting to Fal.ai (${this.model}, ${dur}s, ${aspectRatio})...`);
    this.logger.log(`   Prompt: "${prompt.slice(0, 100)}..."`);

    try {
      // 1. Submit to queue
      const submit = await this.httpJson<{ request_id: string; status_url: string; response_url: string }>(
        'POST',
        `https://queue.fal.run/${this.model}`,
        payload,
        30000,
      );
      if (!submit?.request_id) {
        this.logger.error(`❌ Fal.ai submit failed (no request_id)`);
        return null;
      }
      this.logger.log(`📨 Fal.ai queued: ${submit.request_id}`);

      // 2. Poll status until COMPLETED (or timeout ~6 min)
      const startTs = Date.now();
      const maxWaitMs = 6 * 60 * 1000;
      const statusUrl = submit.status_url;
      const responseUrl = submit.response_url;
      let lastStatus = '';

      while (Date.now() - startTs < maxWaitMs) {
        await this.sleep(5000);
        const status = await this.httpJson<{ status: string; logs?: any[] }>('GET', statusUrl, null, 15000);
        const cur = status?.status ?? 'UNKNOWN';
        if (cur !== lastStatus) {
          this.logger.log(`⏳ Fal.ai status: ${cur} (${Math.round((Date.now() - startTs) / 1000)}s)`);
          lastStatus = cur;
        }
        if (cur === 'COMPLETED') {
          break;
        }
        if (cur === 'FAILED' || cur === 'CANCELLED') {
          this.logger.error(`❌ Fal.ai job ${cur}`);
          return null;
        }
      }

      if (lastStatus !== 'COMPLETED') {
        this.logger.error(`❌ Fal.ai timed out after ${Math.round((Date.now() - startTs) / 1000)}s`);
        return null;
      }

      // 3. Fetch final result
      const result = await this.httpJson<any>('GET', responseUrl, null, 30000);
      const videoUrl: string | undefined = result?.video?.url;
      if (!videoUrl) {
        this.logger.error(`❌ Fal.ai response missing video.url: ${JSON.stringify(result).slice(0, 200)}`);
        return null;
      }
      const seed = typeof result?.seed === 'number' ? result.seed : 0;
      this.logger.log(`✅ Fal.ai video ready: ${videoUrl.slice(0, 80)}...`);
      return { videoUrl, seed };
    } catch (e: any) {
      this.logger.error(`❌ Fal.ai exception: ${e?.message}`);
      return null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  /**
   * Lightweight HTTPS JSON helper. Uses 'Authorization: Key <FAL_KEY>' as Fal.ai requires.
   */
  private httpJson<T>(method: 'GET' | 'POST', url: string, body: any, timeoutMs: number): Promise<T | null> {
    return new Promise((resolve) => {
      try {
        const u = new URL(url);
        const data = body !== null && body !== undefined ? JSON.stringify(body) : '';
        const options: https.RequestOptions = {
          hostname: u.hostname,
          port: 443,
          path: u.pathname + (u.search || ''),
          method,
          headers: {
            Authorization: `Key ${this.apiKey}`,
            Accept: 'application/json',
            ...(method === 'POST'
              ? {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(data),
                }
              : {}),
          },
        };

        const req = https.request(options, (res) => {
          let chunks = '';
          res.on('data', (c) => (chunks += c));
          res.on('end', () => {
            const code = res.statusCode || 0;
            if (code >= 400) {
              this.logger.warn(`Fal.ai HTTP ${code} on ${method} ${url}: ${chunks.slice(0, 300)}`);
              resolve(null);
              return;
            }
            try {
              resolve(JSON.parse(chunks) as T);
            } catch {
              this.logger.warn(`Fal.ai JSON parse error: ${chunks.slice(0, 200)}`);
              resolve(null);
            }
          });
        });
        req.on('error', (e: any) => {
          this.logger.warn(`Fal.ai req error: ${e?.message}`);
          resolve(null);
        });
        req.setTimeout(timeoutMs, () => {
          req.destroy();
          resolve(null);
        });
        if (method === 'POST') req.write(data);
        req.end();
      } catch (e: any) {
        this.logger.warn(`Fal.ai httpJson exception: ${e?.message}`);
        resolve(null);
      }
    });
  }

  /** Download a video from URL to a local tmp file. */
  downloadToFile(url: string, ext = 'mp4'): Promise<string> {
    return new Promise((resolve, reject) => {
      const filePath = path.join(os.tmpdir(), `fal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
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
            try { fs.unlinkSync(filePath); } catch {}
            reject(e);
          });
      };
      handle(url);
    });
  }
}
