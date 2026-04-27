import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { AddSubtitlesDto, GenerateVideoDto, PresignAudioDto, GenerateLyricsDto } from './dto';
import { TEMPLATES } from './templates';
import { FONTS } from './fonts';

@ApiTags('videos')
@Controller('api/videos')
export class VideosController {
  constructor(private readonly svc: VideosService) {}

  @Get('templates')
  @ApiOperation({ summary: 'List available visual templates' })
  templates() {
    return { items: Object.values(TEMPLATES) };
  }

  @Get('fonts')
  @ApiOperation({ summary: 'List available subtitle fonts' })
  fonts() {
    return { items: FONTS };
  }

  @Post('lyrics/generate')
  @ApiOperation({ summary: 'Generate professional flamenco song lyrics with DeepSeek AI' })
  generateLyrics(@Body() dto: GenerateLyricsDto) {
    return this.svc.generateLyrics(dto);
  }

  @Post('audio/presign')
  @ApiOperation({ summary: 'Get a presigned upload URL for the source MP3' })
  presign(@Body() dto: PresignAudioDto) {
    return this.svc.presignAudio(dto);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a video for the given audio + lyric segment' })
  generate(@Body() dto: GenerateVideoDto) {
    return this.svc.generate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List generated videos' })
  list() {
    return this.svc.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single video' })
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Post(':id/subtitles')
  @ApiOperation({ summary: 'Burn customizable subtitles onto an existing video' })
  addSubtitles(@Param('id') id: string, @Body() dto: AddSubtitlesDto) {
    return this.svc.addSubtitles(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a video and its assets' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
