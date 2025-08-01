import { z } from 'zod';
import { body, query, param, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

// Schema base para validação de IDs
export const idSchema = z.string().uuid('ID deve ser um UUID válido');

// Schemas para validação de entrada
export const userInputSchema = z.object({
  firstName: z.string().min(1).max(50).regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  lastName: z.string().min(1).max(50).regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (xx) xxxxx-xxxx'),
  location: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
});

export const eventInputSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  date: z.string().datetime(),
  location: z.string().min(1).max(100),
  price: z.number().min(0).max(10000),
  capacity: z.number().int().min(1).max(10000),
  category: z.enum(['music', 'sports', 'culture', 'food', 'nature', 'adventure']),
});

export const guideInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  specialties: z.array(z.string()).max(10),
  languages: z.array(z.string()).max(5),
  whatsapp: z.string().regex(/^\+55\s\d{2}\s\d{4,5}-\d{4}$/, 'WhatsApp deve estar no formato +55 xx xxxxx-xxxx'),
  instagram: z.string().regex(/^@[a-zA-Z0-9._]+$/, 'Instagram deve começar com @').optional(),
});

export const boatTourInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  duration: z.number().int().min(30).max(480), // 30 min a 8 horas
  price: z.number().min(0).max(10000),
  capacity: z.number().int().min(1).max(100),
  meetingPoint: z.string().min(1).max(200),
  includes: z.array(z.string()).max(10),
  requirements: z.array(z.string()).max(10),
});

// Middleware para validar schemas Zod
export function validateZodSchema<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result; // Substitui com dados validados/sanitizados
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

// Validadores usando express-validator para casos específicos
export const validateUserId = [
  param('id').isUUID().withMessage('ID deve ser um UUID válido'),
];

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
];

export const validateSearchQuery = [
  query('q').optional().isLength({ min: 1, max: 100 }).withMessage('Query de busca deve ter entre 1 e 100 caracteres'),
  query('category').optional().isIn(['trails', 'beaches', 'guides', 'events', 'boat-tours']).withMessage('Categoria inválida'),
];

// Middleware para processar erros de validação
export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg
      }))
    });
  }
  next();
}

// Função auxiliar para validar se uma string é um SQL injection attempt
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(\b(or|and)\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(script|javascript|vbscript|onload|onerror|onclick)\b)/gi,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// Função auxiliar para validar se uma string contém XSS
export function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

// Middleware de validação personalizada para detectar ataques
export function detectMaliciousInput(req: Request, res: Response, next: NextFunction) {
  const checkInput = (obj: any, path: string = ''): string[] => {
    const threats: string[] = [];
    
    if (typeof obj === 'string') {
      if (containsSQLInjection(obj)) {
        threats.push(`SQL injection detectado em ${path}`);
      }
      if (containsXSS(obj)) {
        threats.push(`XSS detectado em ${path}`);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        threats.push(...checkInput(item, `${path}[${index}]`));
      });
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        threats.push(...checkInput(obj[key], path ? `${path}.${key}` : key));
      });
    }
    
    return threats;
  };

  const threats = [
    ...checkInput(req.body, 'body'),
    ...checkInput(req.query, 'query'),
    ...checkInput(req.params, 'params'),
  ];

  if (threats.length > 0) {
    console.error('🚨 TENTATIVA DE ATAQUE DETECTADA:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      path: req.path,
      threats,
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({
      error: 'Entrada maliciosa detectada',
      message: 'Sua requisição foi bloqueada por medidas de segurança'
    });
  }

  next();
}