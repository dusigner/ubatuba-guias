import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

// Local imports
import { handleLocalLogin, requireAuth, getCurrentUser, handleLogout } from './auth.local.js';
import { db } from './db.local.js';
import { populateSampleData } from './sampleData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS headers manually for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'local-dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true only with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'UbatubaIA Local Server Running' });
});

// Local authentication routes
app.get('/api/login', handleLocalLogin);
app.get('/api/auth/user', getCurrentUser);
app.post('/api/auth/logout', handleLogout);

// Import and use the main routes
import('./routes.js').then(({ default: routes }) => {
  app.use('/api', requireAuth, routes);
}).catch(err => {
  console.error('❌ Erro ao carregar rotas:', err);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist/public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/public/index.html'));
  });
}

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor UbatubaIA Local...');
    
    // Populate sample data if needed
    await populateSampleData();
    
    app.listen(PORT, () => {
      console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
      console.log('📊 Cliente React disponível em http://localhost:3000 (modo dev)');
      console.log('🔐 Login automático configurado para desenvolvimento local');
      console.log('');
      console.log('📝 Para iniciar desenvolvimento:');
      console.log('   1. Execute: npm run dev');
      console.log('   2. Acesse: http://localhost:3000');
      console.log('   3. O login será feito automaticamente');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();