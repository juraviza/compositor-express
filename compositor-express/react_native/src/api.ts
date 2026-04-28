import axios, { AxiosError, AxiosInstance } from 'axios';
import type { Lyric, LyricListResponse, GeneratedLyric, Suggestion, Stats, Video, VideoTemplate, VideoFormat, VideoTemplateId, SubtitleFont } from './types';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://compositor-express-1.onrender.com/').replace(/\/+$/, '/');

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  transformRequest: [(data) => {
    if (data == null) return data;
    if (typeof data === 'string') return data;
    try { return JSON.stringify(data); } catch { return data; }
  }],
});

function handle(err: unknown): never {
  const e = err as AxiosError<any>;
  const msg = (e?.response?.data as any)?.message || e?.message || 'Error de red';
  throw new Error(typeof msg === 'string' ? msg : 'Error de red');
}

export const LyricsAPI = {
  list: async (params: Record<string, any> = {}): Promise<LyricListResponse> => {
    try {
      const cleaned: Record<string, any> = {};
      Object.keys(params ?? {}).forEach((k) => {
        const v = (params as any)?.[k];
        if (v !== undefined && v !== null && v !== '') cleaned[k] = v;
      });
      const { data } = await api.get('api/lyrics', { params: cleaned });
      return {
        items: Array.isArray(data?.items) ? data.items : [],
        total: data?.total ?? 0,
        page: data?.page ?? 1,
        totalPages: data?.totalPages ?? 1,
      };
    } catch (e) { return handle(e); }
  },
  get: async (id: string): Promise<Lyric> => {
    try { const { data } = await api.get(`api/lyrics/${id}`); return data; }
    catch (e) { return handle(e); }
  },
  create: async (payload: Partial<Lyric>): Promise<Lyric> => {
    try { const { data } = await api.post('api/lyrics', payload); return data; }
    catch (e) { return handle(e); }
  },
  update: async (id: string, payload: Partial<Lyric>): Promise<Lyric> => {
    try { const { data } = await api.patch(`api/lyrics/${id}`, payload); return data; }
    catch (e) { return handle(e); }
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    try { const { data } = await api.delete(`api/lyrics/${id}`); return data; }
    catch (e) { return handle(e); }
  },
  toggleFavorite: async (id: string, isFavorite: boolean): Promise<Lyric> => {
    try { const { data } = await api.patch(`api/lyrics/${id}`, { isFavorite }); return data; }
    catch (e) { return handle(e); }
  },
  generate: async (payload: { idea: string; theme?: string; emotion?: string; style?: string }): Promise<GeneratedLyric> => {
    try { const { data } = await api.post('api/lyrics/generate', payload); return data; }
    catch (e) { return handle(e); }
  },
  analyze: async (payload: { content: string; lyricId?: string }): Promise<{ suggestions: Suggestion[] }> => {
    try {
      const { data } = await api.post('api/lyrics/analyze', payload);
      return { suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [] };
    } catch (e) { return handle(e); }
  },
  improve: async (payload: { text: string; context: string }): Promise<{ alternatives: string[] }> => {
    try {
      const { data } = await api.post('api/lyrics/improve', payload);
      return { alternatives: Array.isArray(data?.alternatives) ? data.alternatives : [] };
    } catch (e) { return handle(e); }
  },
  stats: async (): Promise<Stats> => {
    try {
      const { data } = await api.get('api/lyrics/stats');
      return { totalLyrics: data?.totalLyrics ?? 0, totalFavorites: data?.totalFavorites ?? 0 };
    } catch (e) { return handle(e); }
  },
};

export const SuggestionsAPI = {
  apply: async (id: string, appliedText: string): Promise<{ id: string; appliedText: string; appliedAt: string }> => {
    try { const { data } = await api.post(`api/suggestions/${id}/apply`, { appliedText }); return data; }
    catch (e) { return handle(e); }
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    try { const { data } = await api.delete(`api/suggestions/${id}`); return data; }
    catch (e) { return handle(e); }
  },
};

export const VideosAPI = {
  templates: async (): Promise<VideoTemplate[]> => {
    try { const { data } = await api.get('api/videos/templates'); return Array.isArray(data?.items) ? data.items : []; }
    catch (e) { return handle(e); }
  },
  presignAudio: async (fileName: string, contentType = 'audio/mpeg'): Promise<{ uploadUrl: string; cloud_storage_path: string }> => {
    try { const { data } = await api.post('api/videos/audio/presign', { fileName, contentType }); return data; }
    catch (e) { return handle(e); }
  },
  generate: async (payload: {
    lyricId?: string;
    title: string;
    audioPath: string;
    lyricsText: string;
    format: VideoFormat;
    template: VideoTemplateId;
    segmentStart?: number;
    segmentEnd?: number;
    autoSelect?: boolean;
    artistName?: string;
    titleFont?: string;
  }): Promise<Video> => {
    try { const { data } = await api.post('api/videos/generate', payload, { timeout: 900000 }); return data; }
    catch (e) { return handle(e); }
  },
  list: async (): Promise<Video[]> => {
    try { const { data } = await api.get('api/videos'); return Array.isArray(data?.items) ? data.items : []; }
    catch (e) { return handle(e); }
  },
  get: async (id: string): Promise<Video> => {
    try { const { data } = await api.get(`api/videos/${id}`); return data; }
    catch (e) { return handle(e); }
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    try { const { data } = await api.delete(`api/videos/${id}`); return data; }
    catch (e) { return handle(e); }
  },
  fonts: async (): Promise<SubtitleFont[]> => {
    try { const { data } = await api.get('api/videos/fonts'); return Array.isArray(data?.items) ? data.items : []; }
    catch (e) { return handle(e); }
  },
  addSubtitles: async (
    id: string,
    payload: {
      lines: string[];
      fontFamily: string;
      fontSize?: number;
      color?: string;
      strokeColor?: string;
      position?: 'top' | 'center' | 'bottom';
    }
  ): Promise<Video> => {
    try { const { data } = await api.post(`api/videos/${id}/subtitles`, payload, { timeout: 300000 }); return data; }
    catch (e) { return handle(e); }
  },
};
