# Quick Start - UbatubaIA Local

## ⚡ Instalação Rápida (5 minutos)

### 1. Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL rodando

### 2. Setup Rápido
```bash
# 1. Renomear arquivos
mv package-local.json package.json
mv vite.config.local.ts vite.config.ts

# 2. Instalar dependências
npm install

# 3. Configurar banco
createdb ubatuba_tourism

# 4. Criar .env
echo "DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/ubatuba_tourism" > .env
echo "OPENAI_API_KEY=sua-chave-openai" >> .env
echo "SESSION_SECRET=minha-chave-secreta-super-longa" >> .env
echo "NODE_ENV=development" >> .env

# 5. Migrar banco
npm run db:push

# 6. Executar (EM TERMINAIS SEPARADOS)
```

### 3. Executar em 2 Terminais

**Terminal 1 - Backend:**
```bash
npm run server:dev
```
Aguarde ver: `express] serving on port 5000`

**Terminal 2 - Frontend:**
```bash  
npm run client:dev
```

### 4. Acessar
- Frontend: http://localhost:3000
- Login: http://localhost:3000/api/login (cria usuário admin automaticamente)

## 🚨 Solução de Problemas Comuns

### Erro "ECONNREFUSED"
- **Causa**: Backend não iniciou antes do frontend
- **Solução**: Sempre iniciar backend primeiro, aguardar ele subir, depois iniciar frontend

### Backend não inicia
```bash
# Verificar erro específico
npm run server:dev

# Se der erro de módulo:
rm -rf node_modules package-lock.json
npm install
```

### "Cannot find module"
- Certifique-se que renomeou os arquivos:
  - `package-local.json` → `package.json`
  - `vite.config.local.ts` → `vite.config.ts`

### PostgreSQL não conecta
```bash
# Testar conexão
psql -U postgres -d ubatuba_tourism

# Se não existir, criar:
createdb ubatuba_tourism
```

## ✅ Verificação Final

1. ✅ Backend rodando na porta 5000
2. ✅ Frontend rodando na porta 3000  
3. ✅ Banco de dados conectado
4. ✅ Login funcionando

**Dica**: Use `http://localhost:3000/api/login` para criar usuário admin automaticamente!