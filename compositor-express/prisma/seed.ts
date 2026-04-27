import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Optional sample lyric — only insert if no lyrics exist
  const count = await prisma.lyric.count();
  if (count === 0) {
    await prisma.lyric.create({
      data: {
        title: 'Bajo la luna de Triana',
        content: 'Bajo la luna de plata\nde Triana enamorada,\nmi corazón se desata\ncon tu mirada gitana.\n\nAy, mi morena, ay, mi morena,\nllévame contigo en tu pena,\nque mi alma vuela y se enreda\nen el quejío de tu cadena.',
        originalIdea: 'Una noche de amor en Triana bajo la luna',
        theme: 'amor',
        emotion: 'pasión',
        style: 'tradicional',
        isFavorite: true,
      },
    });
    console.log('Seeded sample lyric.');
  } else {
    console.log('Lyrics already exist; skipping seed.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
