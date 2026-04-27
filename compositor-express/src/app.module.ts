import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LyricsModule } from './lyrics/lyrics.module';
import { CategoriesModule } from './categories/categories.module';
import { EncyclopediaModule } from './encyclopedia/encyclopedia.module';
import { VideosModule } from './videos/videos.module';
// AvatarModule will be integrated in next iteration

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    LyricsModule,
    CategoriesModule,
    EncyclopediaModule,
    VideosModule,
    // AvatarModule (coming soon),
  ],
})
export class AppModule {}
