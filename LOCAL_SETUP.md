# Configuração Local - UbatubaIA

## Opção 1: Download Direto do Replit

1. No Replit, vá em **Files** > **Show hidden files**
2. Selecione todos os arquivos (Ctrl+A)
3. Clique com botão direito e **Download**
4. Extraia o arquivo ZIP

## Opção 2: Clone via Git (se disponível)

```bash
git clone <url-do-repositorio>
cd ubatuba-tourism-app
```

## Configuração Passo a Passo

### 1. Instalar Node.js
- Baixe e instale Node.js 18+ de https://nodejs.org

### 2. Instalar PostgreSQL
**Windows:**
- Baixe de https://www.postgresql.org/download/windows/
- Durante instalação, defina senha para usuário 'postgres'

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. Configurar Banco de Dados
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE ubatuba_tourism;

# Criar usuário (opcional)
CREATE USER ubatuba_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE ubatuba_tourism TO ubatuba_user;

# Sair
\q
```

### 4. Configurar Projeto
```bash
# Se você baixou do Replit, renomeie os arquivos:
mv package-local.json package.json
mv vite.config.local.ts vite.config.ts

# Instalar dependências
npm install

# Se der erro de módulos, limpe o cache:
rm -rf node_modules package-lock.json
npm install
```

### 5. Variáveis de Ambiente
Crie arquivo `.env` na raiz:

```env
# Database - Ajuste conforme sua configuração
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/ubatuba_tourism

# OpenAI - Obtenha em https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-sua-chave-aqui

# Session Secret - String aleatória para segurança
SESSION_SECRET=sua-string-secreta-muito-longa-e-aleatoria-aqui

# Para desenvolvimento local (opcional)
REPL_ID=local-dev
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=localhost:5000
```

### 6. Inicializar Banco
```bash
# Executar migrações
npm run db:push
```

### 7. Executar Aplicação
```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm run build
npm start
```

## Acessos

- **Aplicação**: http://localhost:5000
- **Cliente (dev)**: http://localhost:3000 (se usar npm run dev)

### 8. Login Local
Como o sistema Replit Auth não funciona localmente, foi criado um sistema de login simples:

1. Acesse: http://localhost:3000/api/login (será redirecionado automaticamente)
2. Um usuário de teste será criado automaticamente com privilégios de admin
3. Você será redirecionado para a página inicial já logado

**Dados do usuário de teste:**
- Email: teste@ubatuba.local
- Nome: Usuário Teste
- Tipo: Administrador

## Criar Usuário Admin

1. Faça login na aplicação
2. Execute no banco de dados:
```sql
UPDATE users SET user_type = 'admin' WHERE email = 'seu-email@exemplo.com';
```

## Solução de Problemas

### Erro de Conexão com Banco
- Verifique se PostgreSQL está rodando
- Confirme URL no .env
- Teste conexão: `psql -U postgres -d ubatuba_tourism`

### Erro de API OpenAI
- Verifique se a chave está correta
- Confirme se tem créditos na conta OpenAI
- Teste com uma requisição simples

### Erro de Porta em Uso
```bash
# Encontrar processo usando porta 5000
lsof -i :5000
# Finalizar processo
kill -9 <PID>
```

### Erro de Dependências (como @neondatabase/serverless)
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Se ainda der erro, verificar se o package.json foi renomeado corretamente
# Deve existir package.json (não package-local.json) na raiz
```

### Erro "Cannot find module"
- Certifique-se que renomeou `package-local.json` para `package.json`
- Execute `npm install` após renomear
- Verifique se está na pasta raiz do projeto

## Scripts Úteis

```bash
# Desenvolvimento completo
npm run dev

# Apenas servidor
npm run server:dev

# Apenas cliente  
npm run client:dev

# Build para produção
npm run build

# Sincronizar schema do banco
npm run db:push

# Abrir Drizzle Studio (interface visual do banco)
npm run db:studio
```

## Estrutura de Arquivos Importante

```
ubatuba-tourism-app/
├── .env                    # Variáveis de ambiente (criar)
├── package.json           # Dependências do projeto
├── server/                # Backend
│   ├── index.ts          # Entrada do servidor
│   ├── db.ts             # Configuração banco
│   └── routes.ts         # APIs
├── client/               # Frontend
│   └── src/              # Código React
├── shared/               # Código compartilhado
│   └── schema.ts         # Modelos do banco
└── README.md             # Documentação completa
```

Agora você pode desenvolver e testar localmente com total controle sobre o ambiente!