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
var PixabayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PixabayService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
let PixabayService = PixabayService_1 = class PixabayService {
    logger = new common_1.Logger(PixabayService_1.name);
    apiKey = process.env.PIXABAY_API_KEY || '';
    async search(query, opts = {}) {
        if (!this.apiKey) {
            this.logger.warn('PIXABAY_API_KEY missing');
            return [];
        }
        const params = new URLSearchParams();
        params.set('key', this.apiKey);
        params.set('q', query);
        params.set('lang', opts.lang || 'es');
        params.set('video_type', opts.videoType || 'all');
        if (opts.category)
            params.set('category', opts.category);
        if (opts.minWidth)
            params.set('min_width', String(opts.minWidth));
        if (opts.minHeight)
            params.set('min_height', String(opts.minHeight));
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
                        resolve(list);
                    }
                    catch (e) {
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
    pickBestFile(video, targetWidth, targetHeight) {
        const wantPortrait = targetHeight > targetWidth;
        const allFiles = [
            video.videos?.large,
            video.videos?.medium,
            video.videos?.small,
            video.videos?.tiny,
        ].filter((f) => !!f && !!f.url && f.width > 0 && f.height > 0);
        if (allFiles.length === 0)
            return null;
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
    downloadToFile(url, ext = 'mp4') {
        return new Promise((resolve, reject) => {
            const filePath = path.join(os.tmpdir(), `pixabay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
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
exports.PixabayService = PixabayService;
exports.PixabayService = PixabayService = PixabayService_1 = __decorate([
    (0, common_1.Injectable)()
], PixabayService);
//# sourceMappingURL=pixabay.service.js.map