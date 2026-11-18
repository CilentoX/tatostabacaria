import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
 const email = process.env.ADMIN_EMAIL;
 const password = process.env.ADMIN_PASSWORD;

 if (!email || !password) {
 console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required for seeding.');
 console.error('   Example: ADMIN_EMAIL=admin@tatos.com.br ADMIN_PASSWORD=strong-password npx tsx src/seed.ts');
 process.exit(1);
 }

 if (password.length < 8) {
 console.error('❌ ADMIN_PASSWORD must be at least 8 characters long.');
 process.exit(1);
 }

 const hashedPassword = await bcrypt.hash(password, 12);

 const existing = await prisma.user.findUnique({ where: { email } });

 if (existing) {
 console.log(`Usuário master já existe: ${email}`);
 return;
 }

 await prisma.user.create({
 data: {
 email,
 password: hashedPassword,
 name: 'Master Admin',
 role: 'master',
 },
 });

 // Settings padrão
 await prisma.setting.upsert({
 where: { key: 'whatsapp_number' },
 update: {},
 create: { key: 'whatsapp_number', value: '5511999999999' },
 });

 await prisma.setting.upsert({
 where: { key: 'instagram_url' },
 update: {},
 create: { key: 'instagram_url', value: 'https://www.instagram.com/tato.tabacaria_' },
 });

 console.log(`Usuário master criado: ${email}`);
 console.log('Settings padrão criados');
}

main()
 .catch((e) => {
 console.error(e);
 process.exit(1);
 })
 .finally(async () => {
 await prisma.$disconnect();
 });