# 🚀 Instalação Rápida - UbatubaIA Local

## ⚡ Instalação em 5 Minutos

### 1. Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL instalado e rodando

### 2. Setup Rápido
```bash
# 1. Baixar projeto do Replit (ou clonar)
# 2. Extrair e navegar para a pasta
cd ubatuba-tourism-app

# 3. Configurar arquivos locais
mv package-local.json package.json
mv vite.config.local.ts vite.config.ts  
mv drizzle.config.local.ts drizzle.config.ts

# 4. Instalar dependências
npm install
```

### 3. Configurar Banco
```bash
# Conectar ao PostgreSQL  
psql -U postgres

# Criar banco
CREATE DATABASE ubatuba_tourism;
\q
```

### 4. Arquivo .env
Crie `.env` na raiz:
```env
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/ubatuba_tourism
GOOGLE_GENAI_API_KEY=sua_chave_google_gemini
SESSION_SECRET=uma_string_super_secreta_aleatoria
NODE_ENV=development
```

### 5. Inicializar e Executar
```bash
# Executar migrações
npm run db:push

# Iniciar aplicação
npm run dev
```

### 6. Acessar
- Abra: http://localhost:3000
- Login será automático!

## 🔧 Problemas Comuns

**Erro de conexão PostgreSQL:**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql
# ou no Windows: verificar serviços
```

**Erro de dependências:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Porta em uso:**
```bash
# Finalizar processo na porta 5000/3000
npx kill-port 5000
npx kill-port 3000
```

## 📋 Checklists

### ✅ Antes de começar:
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL instalado e rodando  
- [ ] Projeto baixado do Replit
- [ ] Chave Google Gemini obtida

### ✅ Após instalação:
- [ ] Banco de dados criado
- [ ] Arquivo .env configurado
- [ ] Dependências instaladas
- [ ] Migrations executadas
- [ ] Aplicação rodando em localhost:3000
- [ ] Login automático funcionando

## 🎯 Próximos Passos

Após a instalação:
1. **Explorar a aplicação** - todas as funcionalidades estarão disponíveis
2. **Testar diferentes perfis** - criar guias, eventos, passeios
3. **Modificar código** - hot-reload está ativo
4. **Acessar banco** - usar `npm run db:studio` para interface visual

---

**🆘 Precisa de ajuda?** Consulte o [LOCAL_SETUP.md](LOCAL_SETUP.md) para instruções completas.