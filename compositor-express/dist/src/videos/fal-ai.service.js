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
var FalAiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FalAiService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
let FalAiService = FalAiService_1 = class FalAiService {
    logger = new common_1.Logger(FalAiService_1.name);
    apiKey = process.env.FAL_API_KEY || '';
    model = 'fal-ai/kling-video/v1.6/standard/text-to-video';
    async generateVideo(prompt, duration = 5, _numFrames = 60, aspectRatio = '16:9') {
        if (!this.apiKey) {
            this.logger.warn('FAL_API_KEY missing');
            return null;
        }
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
            const submit = await this.httpJson('POST', `https://queue.fal.run/${this.model}`, payload, 30000);
            if (!submit?.request_id) {
                this.logger.error(`❌ Fal.ai submit failed (no request_id)`);
                return null;
            }
            this.logger.log(`📨 Fal.ai queued: ${submit.request_id}`);
            const startTs = Date.now();
            const maxWaitMs = 6 * 60 * 1000;
            const statusUrl = submit.status_url;
            const responseUrl = submit.response_url;
            let lastStatus = '';
            while (Date.now() - startTs < maxWaitMs) {
                await this.sleep(5000);
                const status = await this.httpJson('GET', statusUrl, null, 15000);
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
            const result = await this.httpJson('GET', responseUrl, null, 30000);
            const videoUrl = result?.video?.url;
            if (!videoUrl) {
                this.logger.error(`❌ Fal.ai response missing video.url: ${JSON.stringify(result).slice(0, 200)}`);
                return null;
            }
            const seed = typeof result?.seed === 'number' ? result.seed : 0;
            this.logger.log(`✅ Fal.ai video ready: ${videoUrl.slice(0, 80)}...`);
            return { videoUrl, seed };
        }
        catch (e) {
            this.logger.error(`❌ Fal.ai exception: ${e?.message}`);
            return null;
        }
    }
    sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }
    httpJson(method, url, body, timeoutMs) {
        return new Promise((resolve) => {
            try {
                const u = new URL(url);
                const data = body !== null && body !== undefined ? JSON.stringify(body) : '';
                const options = {
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
                            resolve(JSON.parse(chunks));
                        }
                        catch {
                            this.logger.warn(`Fal.ai JSON parse error: ${chunks.slice(0, 200)}`);
                            resolve(null);
                        }
                    });
                });
                req.on('error', (e) => {
                    this.logger.warn(`Fal.ai req error: ${e?.message}`);
                    resolve(null);
                });
                req.setTimeout(timeoutMs, () => {
                    req.destroy();
                    resolve(null);
                });
                if (method === 'POST')
                    req.write(data);
                req.end();
            }
            catch (e) {
                this.logger.warn(`Fal.ai httpJson exception: ${e?.message}`);
                resolve(null);
            }
        });
    }
    downloadToFile(url, ext = 'mp4') {
        return new Promise((resolve, reject) => {
            const filePath = path.join(os.tmpdir(), `fal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
            const file = fs.createWriteStream(filePath);
            const handle = (u, redirects = 0) => {
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
                    }
                    catch { }
                    reject(e);
                });
            };
            handle(url);
        });
    }
};
exports.FalAiService = FalAiService;
exports.FalAiService = FalAiService = FalAiService_1 = __decorate([
    (0, common_1.Injectable)()
], FalAiService);
//# sourceMappingURL=fal-ai.service.js.map