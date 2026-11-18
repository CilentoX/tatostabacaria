import { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../middleware/auth.js';

import { prisma } from '../lib/prisma.js';

export const settingRoutes: FastifyPluginAsync = async (app) => {
  // Listar todas as settings (público - para o frontend consumir)
  app.get('/', async () => {
    const settings = await prisma.setting.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  });

  // Atualizar settings (apenas admin autenticado)
  app.put('/', { preHandler: authenticate }, async (request, reply) => {
    const body = request.body as Record<string, string>;

    if (!body || typeof body !== 'object') {
      return reply.code(400).send({ error: 'Corpo da requisição inválido' });
    }

    const entries = Object.entries(body);
    if (entries.length === 0) {
      return reply.code(400).send({ error: 'Nenhuma configuração fornecida' });
    }

    for (const [key, value] of entries) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    return { message: 'Configurações atualizadas com sucesso' };
  });
};