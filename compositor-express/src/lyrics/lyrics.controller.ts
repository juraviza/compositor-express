import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LyricsService } from './lyrics.service';
import { AnalyzeLyricDto, CreateLyricDto, GenerateLyricDto, ImproveTextDto, ListLyricsQueryDto, UpdateLyricDto } from './dto/lyrics.dto';

@ApiTags('lyrics')
@Controller('api/lyrics')
export class LyricsController {
  constructor(private service: LyricsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregate stats (totalLyrics, totalFavorites)' })
  stats() { return this.service.stats(); }

  @Post('generate')
  @ApiOperation({ summary: 'Generate flamenquito fusion lyric from an idea using LLM' })
  generate(@Body() dto: GenerateLyricDto) { return this.service.generate(dto); }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze lyric and return suggestions' })
  analyze(@Body() dto: AnalyzeLyricDto) { return this.service.analyze(dto); }

  @Post('improve')
  @ApiOperation({ summary: 'Suggest alternatives to improve a specific section' })
  improve(@Body() dto: ImproveTextDto) { return this.service.improve(dto); }

  @Post()
  @ApiOperation({ summary: 'Save a lyric' })
  create(@Body() dto: CreateLyricDto) { return this.service.create(dto); }

  @Get()
  @ApiOperation({ summary: 'List lyrics with filters and pagination' })
  list(@Query() q: ListLyricsQueryDto) { return this.service.list(q); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lyric by id' })
  get(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.getById(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lyric' })
  patch(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateLyricDto) { return this.service.update(id, dto); }

  @Put(':id')
  @ApiOperation({ summary: 'Update a lyric (full)' })
  put(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateLyricDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lyric' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }

  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Toggle favorite status' })
  toggleFav(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.toggleFavorite(id); }
}
