import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.connected = true;
      this.logger.log('Prisma conectado correctamente');
    } catch (error) {
      this.connected = false;
      this.logger.warn(`Prisma no disponible al arrancar. La app seguirá viva para rutas que no dependan de BD. Motivo: ${String((error as Error)?.message || error)}`);
    }
  }

  async onModuleDestroy() {
    if (!this.connected) return;
    await this.$disconnect();
  }
}
