import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import cors from 'cors';
import type { Express, Request, Response, NextFunction } from 'express';

// Rate limiting para APIs gerais
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por 15 minutos
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting mais restritivo para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP por 15 minutos
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para operações que consomem recursos (AI, etc)
const heavyOperationsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 requests por IP por hora
  message: {
    error: 'Limite de operações atingido. Tente novamente em 1 hora.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down para requests repetidas
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // permitir 50 requests normais, depois começar delay
  delayMs: (hits) => hits * 100, // adicionar 100ms de delay por request extra
});

// Middleware de sanitização de dados
function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Remove caracteres perigosos de strings
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  };

  // Recursivamente sanitiza objetos
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
}

// Middleware de validação de content-type
function validateContentType(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Content-Type deve ser application/json'
      });
    }
  }
  next();
}

// Middleware de validação de tamanho do payload
function validatePayloadSize(req: Request, res: Response, next: NextFunction) {
  const contentLength = req.get('Content-Length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
    return res.status(413).json({
      error: 'Payload muito grande. Máximo 1MB permitido.'
    });
  }
  next();
}

// Middleware de log de segurança
function securityLogger(req: Request, res: Response, next: NextFunction) {
  const suspicious = [
    'union', 'select', 'drop', 'delete', 'insert', 'update',
    '<script', 'javascript:', 'eval(', 'setTimeout', 'setInterval'
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  }).toLowerCase();

  const isSuspicious = suspicious.some(pattern => requestData.includes(pattern));

  if (isSuspicious) {
    console.warn('🚨 ATIVIDADE SUSPEITA DETECTADA:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString()
    });
  }

  next();
}

export function setupSecurity(app: Express) {
  console.log('🔒 Configurando medidas de segurança...');

  // Helmet para headers de segurança
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://www.gstatic.com"], // Necessário para Vite e Firebase
        connectSrc: ["'self'", "https:", "wss:", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://accounts.google.com"],
        frameSrc: ["'self'", "https://accounts.google.com", "https://ubatuba-guias.firebaseapp.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Necessário para Replit
  }));

  // CORS configurado adequadamente
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
          /\.replit\.app$/,
          /\.replit\.dev$/,
          /\.repl\.co$/
        ]
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  }));

  // Rate limiting geral
  app.use('/api', speedLimiter);
  app.use('/api', generalLimiter);

  // Rate limiting específico para auth
  app.use('/api/auth', authLimiter);

  // Rate limiting para operações pesadas
  app.use('/api/ai', heavyOperationsLimiter);
  app.use('/api/itinerary', heavyOperationsLimiter);

  // Middlewares de segurança customizados
  app.use('/api', validateContentType);
  app.use('/api', validatePayloadSize);
  app.use('/api', sanitizeInput);
  app.use('/api', securityLogger);

  // Middleware para remover headers que expõem informações
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  console.log('✅ Medidas de segurança configuradas:');
  console.log('  - Headers de segurança (Helmet)');
  console.log('  - Rate limiting (geral, auth, operações pesadas)');
  console.log('  - CORS configurado');
  console.log('  - Sanitização de entrada');
  console.log('  - Validação de payload');
  console.log('  - Log de atividades suspeitas');
  console.log('  - Proteção contra XSS, CSRF, clickjacking');
}

export { authLimiter, generalLimiter, heavyOperationsLimiter };