import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export const AVAILABLE_TITLE_FONTS = ['DejaVuSans-Bold', 'Hunters', 'Blacksword', 'Hello Valentina', 'Cream Cake', 'Cream Cake Bold', 'BillionDreams'] as const;
export type TitleFontType = typeof AVAILABLE_TITLE_FONTS[number];

export class PresignAudioDto {
  @ApiProperty({ example: 'mi-cancion.mp3' })
  @IsString() @MaxLength(200)
  fileName!: string;

  @ApiPropertyOptional({ example: 'audio/mpeg' })
  @IsOptional() @IsString()
  contentType?: string;
}

export class GenerateVideoDto {
  @ApiPropertyOptional({ example: 'uuid', description: 'Optional Lyric id to associate' })
  @IsOptional() @IsString()
  lyricId?: string;

  @ApiProperty({ example: 'Mi Letra de Flamenquito' })
  @IsString() @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'S3 path returned from /api/videos/audio/presign' })
  @IsString()
  audioPath!: string;

  @ApiProperty({ example: 'Letra completa de la canción...' })
  @IsString()
  lyricsText!: string;

  @ApiProperty({ enum: ['vertical', 'horizontal'] })
  @IsIn(['vertical', 'horizontal'])
  format!: 'vertical' | 'horizontal';

  @ApiProperty({ enum: ['pasion', 'noche', 'duende', 'fiesta'] })
  @IsIn(['pasion', 'noche', 'duende', 'fiesta'])
  template!: 'pasion' | 'noche' | 'duende' | 'fiesta';

  @ApiPropertyOptional({ example: true, description: 'Detectar automáticamente el segmento más viral del audio' })
  @IsOptional() @IsBoolean()
  autoSelect?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @IsNumber() @Min(0)
  segmentStart?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional() @IsNumber() @Min(5)
  segmentEnd?: number;

  @ApiPropertyOptional({ example: 'Juan Rafael V.Z' })
  @IsOptional() @IsString() @MaxLength(80)
  artistName?: string;

  @ApiPropertyOptional({ enum: AVAILABLE_TITLE_FONTS, example: 'Hunters', description: 'Font for the title' })
  @IsOptional() @IsIn(AVAILABLE_TITLE_FONTS)
  titleFont?: TitleFontType;
}

export class AddSubtitlesDto {
  @ApiPropertyOptional({ description: 'Lines of text in display order. If empty, the server auto-detects the lyrics for the video segment.', example: ['Mi gitana morena', 'baila al son del compás'] })
  @IsOptional()
  lines?: string[];

  @ApiProperty({ example: 'playfair', description: 'Font ID from /api/videos/fonts' })
  @IsString()
  fontFamily!: string;

  @ApiPropertyOptional({ example: 56, description: 'Font size in pixels' })
  @IsOptional() @IsNumber() @Min(20)
  fontSize?: number;

  @ApiPropertyOptional({ example: 'FFFFFF', description: 'Hex color without #' })
  @IsOptional() @IsString()
  color?: string;

  @ApiPropertyOptional({ example: '000000', description: 'Stroke/border color hex' })
  @IsOptional() @IsString()
  strokeColor?: string;

  @ApiPropertyOptional({ enum: ['top', 'center', 'bottom'], example: 'bottom' })
  @IsOptional() @IsIn(['top', 'center', 'bottom'])
  position?: 'top' | 'center' | 'bottom';
}

export class GenerateLyricsDto {
  @ApiProperty({ example: 'Mi Gitana Morena', description: 'Song title' })
  @IsString() @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'Amor, pasión, duende', description: 'Theme or topic for the lyrics' })
  @IsString() @MaxLength(500)
  theme!: string;

  @ApiPropertyOptional({ example: 'flamenco', description: 'Song style (flamenco, flamenquito, bulería, etc)' })
  @IsOptional() @IsString()
  style?: string;

  @ApiPropertyOptional({ example: 'spanish', description: 'Language for lyrics (spanish, english, etc)' })
  @IsOptional() @IsString()
  language?: string;
}
