# 🖥️ Setup Local para Windows - UbatubaIA

## 📋 Pré-requisitos

### 1. Node.js
- Baixe e instale o Node.js 20 ou superior: https://nodejs.org/
- Verifique a instalação:
```bash
node --version
npm --version
```

### 2. PostgreSQL
- Baixe e instale o PostgreSQL: https://www.postgresql.org/download/windows/
- Durante a instalação, anote a senha do usuário `postgres`
- Ou use Docker Desktop com PostgreSQL

### 3. Git (Opcional)
- Baixe e instale: https://git-scm.com/download/win

## 🚀 Instalação

### 1. Configurar Banco de Dados PostgreSQL

#### Opção A: PostgreSQL Local
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE ubatuba_turismo;

# Criar usuário (opcional)
CREATE USER ubatuba_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE ubatuba_turismo TO ubatuba_user;

# Sair
\q
```

#### Opção B: Docker PostgreSQL
```bash
# Instalar Docker Desktop primeiro
# Executar PostgreSQL em container
docker run --name ubatuba-postgres -e POSTGRES_PASSWORD=sua_senha -e POSTGRES_DB=ubatuba_turismo -p 5432:5432 -d postgres:15
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/ubatuba_turismo"

# Firebase (obrigatório para autenticação)
VITE_FIREBASE_API_KEY="sua_api_key_aqui"
VITE_FIREBASE_PROJECT_ID="seu_project_id"
VITE_FIREBASE_APP_ID="seu_app_id"

# APIs Externas (opcional)
OPENWEATHER_API_KEY="sua_chave_openweather"

# Sessão
SESSION_SECRET="um_texto_muito_secreto_e_longo_aqui"
```

### 3. Instalar Dependências

```bash
# Instalar todas as dependências
npm install

# Verificar se instalou corretamente
npm list --depth=0
```

### 4. Configurar Banco de Dados

```bash
# Executar migrações do banco
npm run db:push

# Popular com dados de exemplo (opcional)
npm run db:seed
```

### 5. Executar Aplicação

```bash
# Modo desenvolvimento
npm run dev

# A aplicação estará disponível em:
# http://localhost:5000
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Banco de dados
npm run db:push      # Aplica mudanças no schema
npm run db:studio    # Interface visual do banco (Drizzle Studio)
npm run db:generate  # Gera migrações

# Produção
npm run build        # Gera build de produção
npm start           # Executa build de produção
```

## 🔥 Configuração do Firebase

### 1. Criar Projeto Firebase
1. Acesse: https://console.firebase.google.com/
2. Clique em "Criar projeto"
3. Siga os passos de configuração

### 2. Configurar Autenticação
1. No console Firebase, vá em "Authentication"
2. Clique em "Começar"
3. Na aba "Sign-in method", ative "Google"
4. Configure domínios autorizados:
   - `localhost` (para desenvolvimento)
   - Seu domínio de produção

### 3. Obter Credenciais
1. Vá em "Configurações do projeto" (ícone de engrenagem)
2. Na aba "Geral", role até "Seus aplicativos"
3. Clique em "Adicionar app" > "Web" (</>)
4. Registre o app e copie as configurações:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID`
   - `appId` → `VITE_FIREBASE_APP_ID`

## ⚙️ Configurações Opcionais

### OpenWeather API (para dados de clima)
1. Registre-se em: https://openweathermap.org/api
2. Obtenha sua chave gratuita
3. Adicione no `.env`: `OPENWEATHER_API_KEY="sua_chave"`

### Visual Studio Code (Recomendado)
Extensões úteis:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Thunder Client (testar APIs)
- PostgreSQL (gerenciar banco)

## 🐛 Resolução de Problemas

### Erro de Porta em Uso
```bash
# Windows - matar processo na porta 5000
netstat -ano | findstr :5000
taskkill /PID <número_do_processo> /F
```

### Erro de Conexão PostgreSQL
1. Verifique se o PostgreSQL está rodando:
   - Windows: Services → PostgreSQL
2. Verifique a string de conexão no `.env`
3. Teste a conexão:
```bash
psql -U postgres -d ubatuba_turismo
```

### Problemas com Firebase
1. Verifique se todas as variáveis estão no `.env`
2. Confirme domínios autorizados no console Firebase
3. Verifique logs do navegador (F12 → Console)

### Erro "Module not found"
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📱 Estrutura do Projeto

```
ubatuba-turismo/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilitários
├── server/              # Backend Express
│   ├── auth/           # Autenticação
│   ├── routes.ts       # Rotas da API
│   └── db.ts          # Configuração do banco
├── shared/             # Código compartilhado
│   └── schema.ts      # Schemas do banco
└── .env               # Variáveis de ambiente
```

## 🔒 Segurança

✅ O aplicativo inclui proteções contra:
- SQL Injection
- XSS (Cross-site scripting)
- CSRF (Cross-site request forgery)
- DDoS e Brute Force
- Clickjacking

## 🚀 Deploy em Produção

Para deploy em produção:
1. Configure domínio no Firebase
2. Use variáveis de ambiente de produção
3. Configure HTTPS
4. Use banco PostgreSQL em nuvem (Neon, Supabase, etc.)

## 📞 Suporte

Em caso de problemas:
1. Verifique este documento primeiro
2. Consulte logs de erro no console
3. Verifique arquivo `SECURITY.md` para questões de segurança