import { FastifyPluginAsync } from 'fastify';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { fileTypeFromBuffer } from 'file-type';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOADS_DIR = join(__dirname, '..', '..', 'uploads');
import { prisma } from '../lib/prisma.js';

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm'];
const ALLOWED_MIMES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];

const MIME_TO_EXT: Record<string, string> = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/webp': '.webp',
	'video/mp4': '.mp4',
	'video/webm': '.webm',
};
const createProductSchema = z.object({
	name: z.string().min(1).max(200),
	type: z.enum(['image', 'video']),
	sortOrder: z.coerce.number().int().min(0).default(0),
	price: z.coerce.number().min(0).optional(),
	description: z.string().max(500).optional(),
 categoryId: z.coerce.number().int().positive().optional().nullable(),
});

function getField(fields: Record<string, unknown>, key: string): string | undefined {
	const field = fields[key];
	if (!field) return undefined;
	if (Array.isArray(field)) return field[0]?.value;
	return (field as { value?: string })?.value;
}

export const productRoutes: FastifyPluginAsync = async (app) => {
const updateProductSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	type: z.enum(['image', 'video']).optional(),
	sortOrder: z.coerce.number().int().min(0).optional(),
	active: z.boolean().optional(),
});
	// Listar todos os produtos (público)
	app.get('/', async () => {
		return prisma.product.findMany({
			where: { active: true },
			orderBy: { sortOrder: 'asc' },
		});
	});

	// Listar todos incluindo inativos (admin) — com paginação cursor-based e busca
	app.get('/all', { preHandler: authenticate }, async (request) => {
		const { cursor, limit, search } = request.query as {
			cursor?: string;
			limit?: string;
			search?: string;
		};

		const take = Math.min(Math.max(parseInt(limit || '20', 10), 1), 100);

		const where: Record<string, unknown> = {};
		if (search && search.trim()) {
			where.OR = [
				{ name: { contains: search.trim() } },
				{ description: { contains: search.trim() } },
			];
		}

		const products = await prisma.product.findMany({
			where,
			orderBy: { sortOrder: 'asc' },
			take: take + 1,
			...(cursor ? { skip: 1, cursor: { id: parseInt(cursor, 10) } } : {}),
		});

		let nextCursor: string | null = null;
		if (products.length > take) {
			const nextItem = products.pop();
			nextCursor = String(nextItem!.id);
		}

		return { items: products, nextCursor };
	});

	// Criar produto com upload
	app.post('/', { preHandler: authenticate }, async (request, reply) => {
		try {
			const data = await request.file();

			if (!data) {
				return reply.code(400).send({ error: 'Arquivo é obrigatório' });
			}

			const parsed = createProductSchema.safeParse({
				name: getField(data.fields, 'name'),
				type: getField(data.fields, 'type'),
				sortOrder: getField(data.fields, 'sortOrder') ?? '0',
				price: getField(data.fields, 'price'),
				description: getField(data.fields, 'description'),
			});

			if (!parsed.success) {
				return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
			}

			const { name, type, sortOrder } = parsed.data;
			await mkdir(UPLOADS_DIR, { recursive: true });

			const buffer = await data.toBuffer();

			const detected = await fileTypeFromBuffer(buffer);
			if (!detected || !ALLOWED_MIMES.includes(detected.mime)) {
				return reply.code(400).send({
					error: `Tipo de arquivo não permitido. Aceitos: ${ALLOWED_MIMES.join(', ')}`,
				});
			}

			const expectedMimes = type === 'video' ? ALLOWED_VIDEO_MIMES : ALLOWED_IMAGE_MIMES;
			if (!expectedMimes.includes(detected.mime)) {
				return reply.code(400).send({
					error: `O arquivo é ${detected.mime} mas o tipo informado é "${type}". Selecione o tipo correto.`,
				});
			}

			const ext = MIME_TO_EXT[detected.mime] || '.bin';
			const filename = `${randomUUID()}${ext}`;
			const filepath = join(UPLOADS_DIR, filename);

			await writeFile(filepath, buffer);

			const src = `/uploads/${filename}`;

			const product = await prisma.product.create({
				data: { name, type, src, sortOrder, price: parsed.data.price, description: parsed.data.description },
			});

			return reply.code(201).send(product);
		} catch (err) {
			app.log.error(err);
			return reply.code(500).send({ error: 'Erro ao criar produto' });
		}
	});

	// Atualizar produto
	app.put('/:id', { preHandler: authenticate }, async (request, reply) => {
		const { id } = request.params as { id: string };

		const parsed = updateProductSchema.safeParse(request.body);
		if (!parsed.success) {
			return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
		}

		try {
			const product = await prisma.product.update({
				where: { id: parseInt(id, 10) },
				data: parsed.data,
			});
			return product;
		} catch {
			return reply.code(404).send({ error: 'Produto não encontrado' });
		}
	});

	// Reordenar produtos (atualiza sortOrder em lote)
	app.put('/reorder', { preHandler: authenticate }, async (request, reply) => {
		const body = request.body as { order: number[] };

		if (!body?.order || !Array.isArray(body.order)) {
			return reply.code(400).send({ error: 'Campo "order" deve ser um array de IDs' });
		}

		try {
			await prisma.$transaction(
				body.order.map((id, index) =>
					prisma.product.update({
						where: { id },
						data: { sortOrder: index + 1 },
					})
				)
			);
			return { success: true };
		} catch (err) {
			app.log.error(err);
			return reply.code(500).send({ error: 'Erro ao reordenar produtos' });
		}
	});

	// Deletar produto (com cleanup de arquivo físico)
	app.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
		const { id } = request.params as { id: string };

		try {
			const product = await prisma.product.findUnique({ where: { id: parseInt(id, 10) } });
			if (!product) {
				return reply.code(404).send({ error: 'Produto não encontrado' });
			}

			// Remover arquivo físico se existir
			if (product.src && product.src.startsWith('/uploads/')) {
				const filePath = join(__dirname, '..', '..', product.src.replace('/uploads/', 'uploads/'));
				try {
					await unlink(filePath);
				} catch {
					// Arquivo já não existe ou erro de permissão — não bloqueia a deleção do registro
					app.log.warn(`Não foi possível remover arquivo: ${filePath}`);
				}
			}

			await prisma.product.delete({ where: { id: parseInt(id, 10) } });
			return reply.code(204).send();
		} catch {
			return reply.code(500).send({ error: 'Erro ao deletar produto' });
		}
	});
};