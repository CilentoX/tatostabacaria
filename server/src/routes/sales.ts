import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';

import { prisma } from '../lib/prisma.js';

const createSaleItemSchema = z.object({
	productId: z.number().int().positive(),
	quantity: z.number().int().positive(),
	unitPrice: z.number().min(0),
});

const createSaleSchema = z.object({
	customerId: z.string().optional().nullable(),
	status: z.enum(['pending', 'completed', 'cancelled']).default('completed'),
	items: z.array(createSaleItemSchema).min(1),
});

export const saleRoutes: FastifyPluginAsync = async (app) => {
	app.addHook('preHandler', authenticate);

	// Listar vendas com filtros opcionais
	app.get('/', async (request) => {
 const { status, customerId, from, to, cursor, limit } = request.query as {
 status?: string;
 customerId?: string;
 from?: string;
 to?: string;
 cursor?: string;
 limit?: string;
 };

 const take = Math.min(Math.max(parseInt(limit || '20', 10), 1), 100);

 const where: Record<string, unknown> = {};
 if (status) where.status = status;
 if (customerId) where.customerId = customerId;
 if (from || to) {
 where.createdAt = {};
 if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
 if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
 }

 const sales = await prisma.sale.findMany({
 where,
 orderBy: { createdAt: 'desc' },
 take: take + 1,
 ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
 include: {
 customer: { select: { id: true, name: true, instagram: true } },
 items: { include: { product: { select: { id: true, name: true } } } },
 },
 });

 let nextCursor: string | null = null;
 if (sales.length > take) {
 const nextItem = sales.pop();
 nextCursor = nextItem!.id;
 }

 return { items: sales, nextCursor };
	});

	// Buscar venda por ID
	app.get('/:id', async (request, reply) => {
 const { id } = request.params as { id: string };
 const sale = await prisma.sale.findUnique({
 where: { id },
 include: {
 customer: true,
 items: { include: { product: true } },
 },
 });
 if (!sale) return reply.code(404).send({ error: 'Venda não encontrada' });
 return sale;
	});

	// Criar venda (decrementa estoque automaticamente)
	app.post('/', async (request, reply) => {
 const parsed = createSaleSchema.safeParse(request.body);
 if (!parsed.success) {
 return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
 }

 const { customerId, status, items } = parsed.data;

 // Verificar estoque disponível antes da transação
 const productIds = items.map((i) => i.productId);
 const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

 for (const item of items) {
 const product = products.find((p) => p.id === item.productId);
 if (!product) {
 return reply.code(400).send({ error: `Produto ID ${item.productId} não encontrado` });
 }
 if (product.stock < item.quantity) {
 return reply.code(400).send({
 error: `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}, solicitado: ${item.quantity}`,
 });
 }
 }

 const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

 try {
 const sale = await prisma.$transaction(async (tx) => {
 // Decrementar estoque
 for (const item of items) {
 await tx.product.update({
 where: { id: item.productId },
 data: { stock: { decrement: item.quantity } },
 });
 }

 // Criar venda com itens
 return tx.sale.create({
 data: {
 customerId: customerId || null,
 status,
 total,
 items: {
 create: items.map((i) => ({
 productId: i.productId,
 quantity: i.quantity,
 unitPrice: i.unitPrice,
 })),
 },
 },
 include: {
 customer: { select: { id: true, name: true, instagram: true } },
 items: { include: { product: { select: { id: true, name: true } } } },
 },
 });
 });

 return reply.code(201).send(sale);
 } catch (err) {
 app.log.error(err);
 return reply.code(500).send({ error: 'Erro ao criar venda' });
 }
	});

	// Cancelar venda (devolve estoque)
	app.patch('/:id/cancel', async (request, reply) => {
 const { id } = request.params as { id: string };

 const sale = await prisma.sale.findUnique({ where: { id }, include: { items: true } });
 if (!sale) return reply.code(404).send({ error: 'Venda não encontrada' });
 if (sale.status === 'cancelled') return reply.code(400).send({ error: 'Venda já está cancelada' });

 try {
 const updated = await prisma.$transaction(async (tx) => {
 // Devolver estoque
 for (const item of sale.items) {
 await tx.product.update({
 where: { id: item.productId },
 data: { stock: { increment: item.quantity } },
 });
 }

 return tx.sale.update({
 where: { id },
 data: { status: 'cancelled' },
 include: {
 customer: { select: { id: true, name: true, instagram: true } },
 items: { include: { product: { select: { id: true, name: true } } } },
 },
 });
 });

 return updated;
 } catch (err) {
 app.log.error(err);
 return reply.code(500).send({ error: 'Erro ao cancelar venda' });
 }
	});

	// Dashboard stats
	app.get('/stats/summary', async () => {
 const now = new Date();
 const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

 const [totalSales, monthSales, totalRevenue, monthRevenue] = await Promise.all([
 prisma.sale.count({ where: { status: 'completed' } }),
 prisma.sale.count({ where: { status: 'completed', createdAt: { gte: startOfMonth } } }),
 prisma.sale.aggregate({ where: { status: 'completed' }, _sum: { total: true } }),
 prisma.sale.aggregate({ where: { status: 'completed', createdAt: { gte: startOfMonth } }, _sum: { total: true } }),
 ]);

 return {
 totalSales,
 monthSales,
 totalRevenue: totalRevenue._sum.total || 0,
 monthRevenue: monthRevenue._sum.total || 0,
 };
	});
};
