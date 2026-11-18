import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { authenticate, requireMaster } from '../middleware/auth.js';

import { prisma } from '../lib/prisma.js';

export const userRoutes: FastifyPluginAsync = async (app) => {
  // Listar todos os usuários (apenas master)
  app.get('/', { preHandler: requireMaster }, async () => {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  // Criar novo usuário admin (apenas master)
  app.post('/', { preHandler: requireMaster }, async (request, reply) => {
    const { email, password, name, role } = request.body as {
      email: string;
      password: string;
      name: string;
      role?: string;
    };

    if (!email || !password || !name) {
      return reply.code(400).send({ error: 'Email, senha e nome são obrigatórios' });
    }

    const userRole = role === 'master' ? 'master' : 'admin';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: userRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return reply.code(201).send(user);
  });

  // Atualizar usuário (apenas master)
  app.put('/:id', { preHandler: requireMaster }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, email, password, role } = request.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    try {
      const updateData: Record<string, unknown> = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role === 'master' ? 'master' : 'admin';
      if (password) updateData.password = await bcrypt.hash(password, 12);

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      return user;
    } catch {
      return reply.code(404).send({ error: 'Usuário não encontrado' });
    }
  });

  // Deletar usuário (apenas master, não pode deletar a si mesmo)
  app.delete('/:id', { preHandler: requireMaster }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const currentUser = request.user as { id: string };

    if (currentUser.id === id) {
      return reply.code(400).send({ error: 'Não é possível deletar sua própria conta' });
    }

    try {
      await prisma.user.delete({ where: { id } });
      return reply.code(204).send();
    } catch {
      return reply.code(404).send({ error: 'Usuário não encontrado' });
    }
  });

  // Alterar própria senha (qualquer usuário autenticado)
  app.patch('/change-password', { preHandler: authenticate }, async (request, reply) => {
    const currentUser = request.user as { id: string };
    const { currentPassword, newPassword } = request.body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      return reply.code(400).send({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
    if (!user) {
      return reply.code(404).send({ error: 'Usuário não encontrado' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return reply.code(401).send({ error: 'Senha atual incorreta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });

    return { message: 'Senha alterada com sucesso' };
  });
};