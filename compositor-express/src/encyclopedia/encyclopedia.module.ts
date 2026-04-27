import { Module } from '@nestjs/common';
import { EncyclopediaController } from './encyclopedia.controller';

@Module({ controllers: [EncyclopediaController] })
export class EncyclopediaModule {}
