import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const createCategorySchema = z.object({
 name: z.string().min(1).max(100),
 slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
 sortOrder: z.coerce.number().int().min(0).default(0),
 active: z.boolean().default(true),
});

const updateCategorySchema = createCategorySchema.partial();

export const categoryRoutes: FastifyPluginAsync = async (app) => {
 // Listar categorias ativas (publico)
 app.get('/', async () => {
 return prisma.category.findMany({
 where: { active: true },
 orderBy: { sortOrder: 'asc' },
 });
 });

 // Listar todas incluindo inativas (admin)
 app.get('/all', { preHandler: authenticate }, async () => {
 return prisma.category.findMany({
 orderBy: { sortOrder: 'asc' },
 include: { _count: { select: { products: true } } },
 });
 });

 // Criar categoria
 app.post('/', { preHandler: authenticate }, async (request, reply) => {
 const parsed = createCategorySchema.safeParse(request.body);
 if (!parsed.success) {
 return reply.code(400).send({ error: 'Dados invalidos', details: parsed.error.flatten() });
 }
 try {
 const category = await prisma.category.create({ data: parsed.data });
 return reply.code(201).send(category);
 } catch (err: any) {
 if (err?.code === 'P2002') {
 return reply.code(409).send({ error: 'Categoria com esse nome ou slug ja existe' });
 }
 throw err;
 }
 });

 // Atualizar categoria
 app.put('/:id', { preHandler: authenticate }, async (request, reply) => {
 const { id } = request.params as { id: string };
 const parsed = updateCategorySchema.safeParse(request.body);
 if (!parsed.success) {
 return reply.code(400).send({ error: 'Dados invalidos', details: parsed.error.flatten() });
 }
 try {
 const category = await prisma.category.update({ where: { id: parseInt(id, 10) }, data: parsed.data });
 return category;
 } catch {
 return reply.code(404).send({ error: 'Categoria nao encontrada' });
 }
 });

 // Deletar categoria
 app.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
 const { id } = request.params as { id: string };
 try {
 await prisma.category.delete({ where: { id: parseInt(id, 10) } });
 return reply.code(204).send();
 } catch {
 return reply.code(404).send({ error: 'Categoria nao encontrada' });
 }
 });
};