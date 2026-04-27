import { Body, Controller, Delete, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuggestionsService } from './suggestions.service';
import { ApplySuggestionDto } from './dto/lyrics.dto';

@ApiTags('suggestions')
@Controller('api/suggestions')
export class SuggestionsController {
  constructor(private service: SuggestionsService) {}

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply a suggestion to a lyric' })
  apply(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: ApplySuggestionDto) {
    return this.service.apply(id, dto.appliedText);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a suggestion' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
