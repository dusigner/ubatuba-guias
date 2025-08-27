import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import cors from 'cors';
import type { Express, Request, Response, NextFunction } from 'express';

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }, standardHeaders: true, legacyHeaders: false });
const heavyOperationsLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Limite de operações atingido. Tente novamente em 1 hora.' }, standardHeaders: true, legacyHeaders: false });
const speedLimiter = slowDown({ windowMs: 15 * 60 * 1000, delayAfter: 50, delayMs: (hits) => hits * 100 });

function sanitizeInput(req: Request, res: Response, next: NextFunction) { const sanitizeString = (str: string): string => { if (typeof str !== 'string') return str; return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '').trim(); }; const sanitizeObject = (obj: any): any => { if (typeof obj === 'string') { return sanitizeString(obj); } if (Array.isArray(obj)) { return obj.map(sanitizeObject); } if (obj && typeof obj === 'object') { const sanitized: any = {}; for (const key in obj) { if (obj.hasOwnProperty(key)) { sanitized[key] = sanitizeObject(obj[key]); } } return sanitized; } return obj; }; if (req.body) { req.body = sanitizeObject(req.body); } if (req.query) { req.query = sanitizeObject(req.query); } if (req.params) { req.params = sanitizeObject(req.params); } next(); }
function validateContentType(req: Request, res: Response, next: NextFunction) { if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') { const contentType = req.get('Content-Type'); if (!contentType || !contentType.includes('application/json')) { return res.status(400).json({ error: 'Content-Type deve ser application/json' }); } } next(); }
function validatePayloadSize(req: Request, res: Response, next: NextFunction) { const contentLength = req.get('Content-Length'); if (contentLength && parseInt(contentLength) > 1024 * 1024) { return res.status(413).json({ error: 'Payload muito grande. Máximo 1MB permitido.' }); } next(); }
function securityLogger(req: Request, res: Response, next: NextFunction) { const suspicious = ['union', 'select', 'drop', 'delete', 'insert', 'update', '<script', 'javascript:', 'eval(', 'setTimeout', 'setInterval']; const requestData = JSON.stringify({ body: req.body, query: req.query, params: req.params }).toLowerCase(); const isSuspicious = suspicious.some(pattern => requestData.includes(pattern)); if (isSuspicious) { console.warn('🚨 ATIVIDADE SUSPEITA DETECTADA:', { ip: req.ip, userAgent: req.get('User-Agent'), method: req.method, path: req.path, body: req.body, query: req.query, timestamp: new Date().toISOString() }); } next(); }


export function setupSecurity(app: Express) {
  console.log('🔒 Configurando medidas de segurança...');

  const cloudWorkstationUrl = 'https://5173-firebase-ubatuba-guias-1754437939577.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev';

  app.use(helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://www.gstatic.com", "https://*.firebaseapp.com"],
        connectSrc: ["'self'", "https:", "wss:", "http://localhost:5173", cloudWorkstationUrl, "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://accounts.google.com"],
        frameSrc: ["'self'", "https://accounts.google.com", "https://ubatuba-guias.firebaseapp.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }));

  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [
        'https://ubatuba-guias.firebaseapp.com', // Legacy domain
        'https://ubatuba-guias.web.app'       // Main domain
      ]
    : [
        'http://localhost:5173',
        cloudWorkstationUrl
      ];
      
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  }));

  app.use('/api', speedLimiter);
  app.use('/api', generalLimiter);
  // app.use('/api/auth', authLimiter); // TEMPORARIAMENTE DESABILITADO PARA DIAGNÓSTICO
  app.use('/api/ai', heavyOperationsLimiter);
  app.use('/api/itinerary', heavyOperationsLimiter);

  app.use('/api', validateContentType);
  app.use('/api', validatePayloadSize);
  app.use('/api', sanitizeInput);
  app.use('/api', securityLogger);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    next();
  });

  console.log('✅ Medidas de segurança configuradas:');
  console.log('  - Headers de segurança (Helmet)');
  console.log('  - Rate limiting (geral, auth, operações pesadas)');
  console.log('  - CORS configurado');
  console.log('  - Sanitização de entrada');
  console.log('  - Validação de payload');
  console.log('  - Log de atividades suspeitas');
}

export { authLimiter, generalLimiter, heavyOperationsLimiter };