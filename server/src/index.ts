import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authRoutes } from './routes/auth.js';
import { productRoutes } from './routes/products.js';
import { userRoutes } from './routes/users.js';
import { settingRoutes } from './routes/settings.js';
import { customerRoutes } from './routes/customers.js';
import { saleRoutes } from './routes/sales.js';
import { categoryRoutes } from './routes/categories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Fastify({ logger: true });

await app.register(cors, {
 origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : ['http://localhost:3000', 'http://localhost:5173'],
 credentials: true,
 methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
 allowedHeaders: ['Content-Type', 'Authorization'],
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
 console.error('❌ JWT_SECRET environment variable is required. Set it before starting the server.');
 process.exit(1);
}

await app.register(jwt, {
 secret: JWT_SECRET,
 sign: { expiresIn: '24h' },
});

await app.register(multipart, {
 limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});


await app.register(rateLimit, {
 max: 100,
 timeWindow: '1 minute',
 allowList: ['127.0.0.1'],
});

// Servir arquivos de upload estaticamente
await app.register(fastifyStatic, {
 root: join(__dirname, '..', 'uploads'),
 prefix: '/uploads/',
});

// Rotas públicas (sem auth)
app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Rotas protegidas
await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(productRoutes, { prefix: '/api/products' });
await app.register(userRoutes, { prefix: '/api/users' });
await app.register(settingRoutes, { prefix: '/api/settings' });
await app.register(customerRoutes, { prefix: '/api/customers' });
await app.register(saleRoutes, { prefix: '/api/sales' });
await app.register(categoryRoutes, { prefix: '/api/categories' });

const port = parseInt(process.env.PORT || '4000', 10);
const host = process.env.HOST || '0.0.0.0';

try {
 await app.listen({ port, host });
 console.log(`🚀 Tatos Tabacaria API running on http://${host}:${port}`);
} catch (err) {
 app.log.error(err);
 process.exit(1);
}