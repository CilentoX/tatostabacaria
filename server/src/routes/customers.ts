import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';

import { prisma } from '../lib/prisma.js';

const createCustomerSchema = z.object({
	name: z.string().min(1).max(200),
	instagram: z.string().max(100).optional().nullable(),
	phone: z.string().max(30).optional().nullable(),
	notes: z.string().max(500).optional().nullable(),
});

const updateCustomerSchema = createCustomerSchema.partial();

export const customerRoutes: FastifyPluginAsync = async (app) => {
	app.addHook('preHandler', authenticate);

	// Listar todos os clientes
	app.get('/', async () => {
		return prisma.customer.findMany({
			orderBy: { updatedAt: 'desc' },
			include: { _count: { select: { sales: true } } },
		});
	});

	// Buscar cliente por ID
	app.get('/:id', async (request, reply) => {
		const { id } = request.params as { id: string };
		const customer = await prisma.customer.findUnique({
			where: { id },
			include: {
				sales: {
					orderBy: { createdAt: 'desc' },
					include: { items: { include: { product: true } } },
				},
			},
		});
		if (!customer) return reply.code(404).send({ error: 'Cliente não encontrado' });
		return customer;
	});

	// Criar cliente
	app.post('/', async (request, reply) => {
		const parsed = createCustomerSchema.safeParse(request.body);
		if (!parsed.success) {
			return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
		}
		const customer = await prisma.customer.create({ data: parsed.data });
		return reply.code(201).send(customer);
	});

	// Atualizar cliente
	app.put('/:id', async (request, reply) => {
		const { id } = request.params as { id: string };
		const parsed = updateCustomerSchema.safeParse(request.body);
		if (!parsed.success) {
			return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
		}
		try {
			const customer = await prisma.customer.update({ where: { id }, data: parsed.data });
			return customer;
		} catch {
			return reply.code(404).send({ error: 'Cliente não encontrado' });
		}
	});

	// Deletar cliente
	app.delete('/:id', async (request, reply) => {
		const { id } = request.params as { id: string };
		try {
			await prisma.customer.delete({ where: { id } });
			return reply.code(204).send();
		} catch {
			return reply.code(404).send({ error: 'Cliente não encontrado' });
		}
	});
};
