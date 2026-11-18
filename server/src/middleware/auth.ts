import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Não autorizado' });
  }
}

export async function requireMaster(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = await request.jwtVerify<{ id: string; role: string }>();
    if (user.role !== 'master') {
      reply.code(403).send({ error: 'Acesso negado. Apenas master.' });
    }
  } catch (err) {
    reply.code(401).send({ error: 'Não autorizado' });
  }
}