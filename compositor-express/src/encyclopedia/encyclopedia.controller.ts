import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EXAMPLES, STRUCTURE, TIPS, VOCABULARY } from './encyclopedia.data';

@ApiTags('encyclopedia')
@Controller('api/encyclopedia')
export class EncyclopediaController {
  @Get('examples')
  @ApiOperation({ summary: 'Classic flamenquito lyric examples' })
  examples() { return { items: EXAMPLES }; }

  @Get('vocabulary')
  @ApiOperation({ summary: 'Typical flamenco vocabulary' })
  vocabulary() { return { items: VOCABULARY }; }

  @Get('tips')
  @ApiOperation({ summary: 'Writing tips for flamenquito fusion' })
  tips() { return { items: TIPS }; }

  @Get('structure')
  @ApiOperation({ summary: 'Typical song structure' })
  structure() { return STRUCTURE; }
}
