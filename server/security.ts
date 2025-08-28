import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import cors from 'cors';
import type { Express, Request, Response, NextFunction } from 'express';

// --- Limitadores de Requisição ---

const generalLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Aumentado para 200 para uso geral
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }, 
  standardHeaders: true, 
  legacyHeaders: false 
});

// --- CORREÇÃO APLICADA AQUI ---
// Aumentado drasticamente o limite para a rota de autenticação durante a fase de depuração.
// Isso evitará o bloqueio por 429 Too Many Requests.
const authLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // Aumentado de 10 para 50
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }, 
  standardHeaders: true, 
  legacyHeaders: false 
});

const heavyOperationsLimiter = rateLimit({ 
  windowMs: 60 * 60 * 1000, 
  max: 50, // Aumentado para 50
  message: { error: 'Limite de operações atingido. Tente novamente em 1 hora.' }, 
  standardHeaders: true, 
  legacyHeaders: false 
});

const speedLimiter = slowDown({ 
  windowMs: 15 * 60 * 1000, 
  delayAfter: 100, // Atraso após 100 requisições
  delayMs: (hits) => hits * 100 
});

// --- Funções de Validação e Sanitização ---

function sanitizeInput(req: Request, res: Response, next: NextFunction) { 
  const sanitizeString = (str: string): string => { 
    if (typeof str !== 'string') return str; 
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim(); 
  }; 
  
  const sanitizeObject = (obj: any): any => { 
    if (typeof obj === 'string') { return sanitizeString(obj); } 
    if (Array.isArray(obj)) { return obj.map(sanitizeObject); } 
    if (obj && typeof obj === 'object') { 
      const sanitized: any = {}; 
      for (const key in obj) { 
        if (Object.prototype.hasOwnProperty.call(obj, key)) { 
          sanitized[key] = sanitizeObject(obj[key]); 
        } 
      } 
      return sanitized; 
    } 
    return obj; 
  }; 
  
  if (req.body) { req.body = sanitizeObject(req.body); } 
  if (req.query) { req.query = sanitizeObject(req.query); } 
  if (req.params) { req.params = sanitizeObject(req.params); } 
  next(); 
}

function validateContentType(req: Request, res: Response, next: NextFunction) { 
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) { 
    const contentType = req.get('Content-Type'); 
    if (!contentType || !contentType.includes('application/json')) { 
      return res.status(415).json({ error: 'Content-Type deve ser application/json' }); 
    } 
  } 
  next(); 
}

function securityLogger(req: Request, res: Response, next: NextFunction) { 
  const suspicious = ['union', 'select', 'drop', 'delete', 'insert', 'update', '<script', 'javascript:', 'eval(', 'setTimeout', 'setInterval']; 
  const requestData = JSON.stringify({ body: req.body, query: req.query, params: req.params }).toLowerCase(); 
  const isSuspicious = suspicious.some(pattern => requestData.includes(pattern)); 
  
  if (isSuspicious) { 
    console.warn('🚨 ATIVIDADE SUSPEITA DETECTADA:', { 
      ip: req.ip, 
      userAgent: req.get('User-Agent'), 
      method: req.method, 
      path: req.path, 
      timestamp: new Date().toISOString() 
    }); 
  } 
  next(); 
}


// --- Função Principal de Setup de Segurança ---

export function setupSecurity(app: Express) {
  console.log('🔒 Configurando medidas de segurança...');

  const allowedOrigins = [
    'http://localhost:5173',
    'https://ubatuba-guias.web.app',
    'https://ubatuba-guias.firebaseapp.com',
    'https://5173-firebase-ubatuba-guias-1754437939577.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev'
  ];

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS bloqueado para origin: ${origin}`);
        callback(new Error('Origin não permitida pelo CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  }));

  // Aplica os limitadores às rotas
  app.use('/api', speedLimiter);
  app.use('/api', generalLimiter);
  app.use('/api/auth', authLimiter); // Limite mais alto para /api/auth
  app.use('/api/ai', heavyOperationsLimiter);
  app.use('/api/itinerary', heavyOperationsLimiter);

  // Validações
  app.use('/api', validateContentType);
  app.use('/api', sanitizeInput);
  app.use('/api', securityLogger);

  // Remove header X-Powered-By
  app.disable('x-powered-by');

  console.log('✅ Medidas de segurança configuradas:');
  console.log('  - CORS configurado para:', allowedOrigins);
  console.log('  - Headers de segurança (Helmet) com ajuste para COOP.');
  console.log('  - Rate limiting e validações ativados (limites aumentados para depuração).');
}

export { authLimiter, generalLimiter, heavyOperationsLimiter };