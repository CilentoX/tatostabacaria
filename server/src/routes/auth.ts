import rateLimit from '@fastify/rate-limit';
import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';

import { prisma } from '../lib/prisma.js';

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Login com rate-limit específico (5 req/min por IP)
  app.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email e senha são obrigatórios' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return reply.code(401).send({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return reply.code(401).send({ error: 'Credenciais inválidas' });
    }

    const token = app.jwt.sign({ id: user.id, role: user.role, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  });

  // Verificar token / obter usuário atual
  app.get('/me', async (request, reply) => {
    try {
      const decoded = await request.jwtVerify<{ id: string; role: string; email: string }>();
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      if (!user) {
        return reply.code(404).send({ error: 'Usuário não encontrado' });
      }

      return user;
    } catch {
      return reply.code(401).send({ error: 'Token inválido' });
    }
  });
};