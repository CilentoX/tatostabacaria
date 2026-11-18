import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { name: 'Seda OCB Premium', type: 'image' as const, src: '/assets/seda-ocb-premium.jpeg', sortOrder: 1 },
  { name: 'Bong de Vidro Artesanal', type: 'image' as const, src: '/assets/bong-vidro-artesanal.jpeg', sortOrder: 2 },
  { name: 'Isqueiro Maçarico Turbo', type: 'image' as const, src: '/assets/isqueiro-macarico-turbo.jpeg', sortOrder: 3 },
  { name: 'Piteira de Bambu Natural', type: 'image' as const, src: '/assets/piteira-bambu-natural.jpeg', sortOrder: 4 },
  { name: 'Tray de Madeira Rústica', type: 'image' as const, src: '/assets/tray-madeira-rustica.jpeg', sortOrder: 5 },
  { name: 'Moinho Grinder Metal', type: 'image' as const, src: '/assets/moinho-grinder-metal.jpeg', sortOrder: 6 },
  { name: 'Cigarreira de Couro', type: 'image' as const, src: '/assets/cigarreira-couro.jpeg', sortOrder: 7 },
  { name: 'Demo - Acessórios Premium', type: 'video' as const, src: '/assets/demo-acessorios-premium.mp4', sortOrder: 8 },
  { name: 'Kit Seda + Piteira Combo', type: 'image' as const, src: '/assets/kit-seda-piteira-combo.jpeg', sortOrder: 9 },
  { name: 'Review - Bong Cristal', type: 'video' as const, src: '/assets/review-bong-cristal.mp4', sortOrder: 10 },
  { name: 'Unboxing Coleção Tatos', type: 'video' as const, src: '/assets/unboxing-colecao-tatos.mp4', sortOrder: 11 },
  { name: 'Tour pela Loja', type: 'video' as const, src: '/assets/tour-pela-loja.mp4', sortOrder: 12 },
  { name: 'Novidades da Semana', type: 'video' as const, src: '/assets/novidades-da-semana.mp4', sortOrder: 13 },
];

async function main() {
  console.log('🌱 Seeding products...');

  await prisma.product.deleteMany();
  console.log('  ↳ Produtos anteriores removidos');

  for (const product of products) {
    await prisma.product.create({ data: product });
    console.log(`  ✓ ${product.name} (${product.type})`);
  }

  console.log(`\n✅ ${products.length} produtos cadastrados com sucesso!`);
}

main()
  .catch((err) => {
    console.error('❌ Erro ao seedar produtos:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());