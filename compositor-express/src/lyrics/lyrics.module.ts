import { Module } from '@nestjs/common';
import { LyricsController } from './lyrics.controller';
import { LyricsService } from './lyrics.service';
import { LlmModule } from '../llm/llm.module';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';

@Module({
  imports: [LlmModule],
  controllers: [LyricsController, SuggestionsController],
  providers: [LyricsService, SuggestionsService],
})
export class LyricsModule {}
