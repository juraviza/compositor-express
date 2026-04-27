import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { FfmpegService } from './ffmpeg.service';
import { AudioAnalysisService } from './audio-analysis.service';
import { SceneSelectionService } from './scene-selection.service';
import { PexelsService } from './pexels.service';
import { PixabayService } from './pixabay.service';
import { ClipSelectionService } from './clip-selection.service';
import { KeywordExtractorService } from './keyword-extractor.service';
import { FalAiService } from './fal-ai.service';
import { EmotionalPromptGeneratorService } from './emotional-prompt-generator.service';
import { LlmModule } from '../llm/llm.module';
import { DeepSeekModule } from '../deepseek/deepseek.module';

@Module({
  imports: [LlmModule, DeepSeekModule],
  controllers: [VideosController],
  providers: [VideosService, FfmpegService, AudioAnalysisService, SceneSelectionService, PexelsService, PixabayService, ClipSelectionService, KeywordExtractorService, FalAiService, EmotionalPromptGeneratorService],
})
export class VideosModule {}
