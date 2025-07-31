# 🏖️ UbatubaIA - Configuração Local

Siga este guia para executar o projeto UbatubaIA em sua máquina pessoal.

## 📦 Como Obter o Projeto

### Opção 1: Download Direto do Replit

1. No Replit, vá em **Files** > **Show hidden files**
2. Selecione todos os arquivos (Ctrl+A)
3. Clique com botão direito e **Download**
4. Extraia o arquivo ZIP em sua máquina

### Opção 2: Clone via Git (se disponível)

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
# Navegue até a pasta do projeto
cd ubatuba-tourism-app

# Se você baixou do Replit, renomeie os arquivos para desenvolvimento local:
mv package-local.json package.json
mv vite.config.local.ts vite.config.ts
mv drizzle.config.local.ts drizzle.config.ts

# Instalar dependências
npm install

# Se der erro de módulos, limpe o cache e reinstale:
rm -rf node_modules package-lock.json
npm install
```

### 5. Variáveis de Ambiente
Crie arquivo `.env` na raiz do projeto:

```env
# Database - Ajuste conforme sua configuração PostgreSQL
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/ubatuba_tourism

# Google Gemini API - Obtenha em https://aistudio.google.com/app/apikey
GOOGLE_GENAI_API_KEY=sua-chave-google-gemini-aqui

# Session Secret - String aleatória para segurança
SESSION_SECRET=sua-string-secreta-muito-longa-e-aleatoria-para-sessoes

# Ambiente de desenvolvimento
NODE_ENV=development

# Configurações locais (opcional)
REPL_ID=local-dev
REPLIT_DOMAINS=localhost:5000
```

**⚠️ Importante:** O projeto agora usa Google Gemini (gratuito) ao invés do OpenAI (pago). Para obter sua chave:
1. Acesse https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave e cole no arquivo .env

### 6. Inicializar Banco
```bash
# Executar migrações
npm run db:push
```

### 7. Executar Aplicação

```bash
# Desenvolvimento completo (recomendado)
npm run dev

# Ou executar separadamente:
# Terminal 1 - Servidor backend
npm run server:dev

# Terminal 2 - Cliente frontend  
npm run client:dev
```

## 🌐 Acessos

- **Aplicação Completa**: http://localhost:3000 (desenvolvimento)
- **Servidor API**: http://localhost:5000 (backend apenas)
- **Cliente Produção**: http://localhost:5000 (após build)

### 8. 🔐 Login Local Automático

O sistema de autenticação Replit não funciona localmente, então criamos um sistema simplificado:

1. **Acesse**: http://localhost:3000
2. **Clique em qualquer botão de login** - será redirecionado automaticamente
3. **Usuário admin será criado** automaticamente na primeira execução
4. **Login automático** - você será redirecionado já autenticado

**👤 Dados do usuário local:**
- **Email**: admin@ubatuba.local  
- **Nome**: Admin Local
- **Tipo**: Administrador (acesso total)
- **Perfil**: Completo (pode acessar todas as funcionalidades)

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