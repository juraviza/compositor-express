import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuggestionsService {
  constructor(private prisma: PrismaService) {}

  async apply(id: string, appliedText: string) {
    const exists = await this.prisma.suggestion.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Suggestion not found');
    const now = new Date();
    const updated = await this.prisma.suggestion.update({ where: { id }, data: { appliedText, appliedAt: now } });
    return { id: updated.id, appliedText: updated.appliedText, appliedAt: updated.appliedAt };
  }

  async remove(id: string) {
    const exists = await this.prisma.suggestion.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Suggestion not found');
    await this.prisma.suggestion.delete({ where: { id } });
    return { success: true };
  }
}
