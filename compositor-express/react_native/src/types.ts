export interface Lyric {
  id: string;
  title: string;
  content: string;
  originalIdea?: string | null;
  theme?: string | null;
  emotion?: string | null;
  style?: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  suggestions?: Suggestion[];
}

export type Severity = 'critical' | 'suggested' | 'optional';

export interface Suggestion {
  id?: string;
  lyricId?: string;
  originalText: string;
  suggestedTexts: string[];
  positionStart: number;
  positionEnd: number;
  severity: Severity;
  reason: string;
  appliedText?: string | null;
  appliedAt?: string | null;
  createdAt?: string;
}

export interface GeneratedLyric {
  title: string;
  content: string;
}

export interface LyricListResponse {
  items: Lyric[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Stats {
  totalLyrics: number;
  totalFavorites: number;
}

export type VideoFormat = 'vertical' | 'horizontal';
export type VideoTemplateId = 'pasion' | 'noche' | 'duende' | 'fiesta';

export interface VideoTemplate {
  id: VideoTemplateId;
  name: string;
  description: string;
  bgColorA: string;
  bgColorB: string;
  bgColorC: string;
  textColor: string;
  accentColor: string;
}

export type VideoStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface Video {
  id: string;
  lyricId?: string | null;
  title: string;
  audioPath?: string | null;
  videoPath?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  format: VideoFormat;
  template: VideoTemplateId;
  segmentStart: number;
  segmentEnd: number;
  durationSec: number;
  status: VideoStatus;
  errorMsg?: string | null;
  lyricsText: string;
  artistName?: string | null;
  videoSubtitlesPath?: string | null;
  videoSubtitlesUrl?: string | null;
  subtitlesConfig?: string | null;
  audioDurationSec?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubtitleFont {
  id: string;
  name: string;
  file: string;
  style: string;
}
