import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLyricDto {
  @ApiProperty({ example: 'Noche de luna en Triana' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Bajo la luna de plata...\n\nMi alma vuela...' })
  @IsString()
  content!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() originalIdea?: string;
  @ApiPropertyOptional({ example: 'amor' }) @IsOptional() @IsString() theme?: string;
  @ApiPropertyOptional({ example: 'pasión' }) @IsOptional() @IsString() emotion?: string;
  @ApiPropertyOptional({ example: 'fusión' }) @IsOptional() @IsString() style?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFavorite?: boolean;
}

export class UpdateLyricDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() theme?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emotion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() style?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFavorite?: boolean;
}

export class ListLyricsQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() theme?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emotion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() style?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  isFavorite?: boolean | string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
}

export class GenerateLyricDto {
  @ApiProperty({ example: 'Una noche de desamor en Sevilla' })
  @IsString()
  idea!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() theme?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emotion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() style?: string;
}

export class AnalyzeLyricDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() lyricId?: string;
  @ApiProperty() @IsString() content!: string;
}

export class ImproveTextDto {
  @ApiProperty() @IsString() text!: string;
  @ApiProperty() @IsString() context!: string;
}

export class ApplySuggestionDto {
  @ApiProperty() @IsString() appliedText!: string;
}
