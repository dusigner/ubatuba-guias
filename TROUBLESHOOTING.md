# Solução de Problemas - UbatubaIA

## ❌ Erro: "Cannot find module '@neondatabase/serverless'"

Este é o erro mais comum ao configurar o projeto localmente. Aqui estão as soluções:

### Solução 1: Renomear Arquivos Corretamente
```bash
# Na pasta raiz do projeto, execute:
mv package-local.json package.json
mv vite.config.local.ts vite.config.ts

# Verificar se os arquivos foram renomeados:
ls -la package.json
ls -la vite.config.ts
```

### Solução 2: Reinstalar Dependências
```bash
# Remover instalação anterior
rm -rf node_modules
rm package-lock.json

# Instalar novamente
npm install
```

### Solução 3: Verificar Node.js
```bash
# Verificar versão do Node.js (deve ser 18+)
node --version

# Se for menor que 18, atualize o Node.js
```

### Solução 4: Configuração TypeScript
Se ainda der erro, crie um arquivo `tsconfig.json` na raiz:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

## ❌ Outros Erros Comuns

### "Error: Cannot find module 'drizzle-orm'"
```bash
npm install drizzle-orm drizzle-kit @neondatabase/serverless
```

### "Warning: To load an ES module, set "type": "module""
- Certifique-se que o `package.json` tem `"type": "module"`
- Ou renomeie arquivos .ts para .mts

### "ECONNREFUSED" - Erro de Conexão com Banco
1. Verifique se PostgreSQL está rodando:
```bash
# Windows
net start postgresql-x64-14

# macOS/Linux
sudo systemctl start postgresql
# ou
brew services start postgresql
```

2. Teste a conexão:
```bash
psql -U postgres -d ubatuba_tourism
```

3. Verifique a URL no .env:
```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/ubatuba_tourism
```

### "OpenAI API Error"
1. Verifique se a chave está correta no .env
2. Teste a chave em https://platform.openai.com/playground
3. Confirme se tem créditos na conta

### "HTTP ERROR 500" no /api/login
Este erro é normal em desenvolvimento local! O sistema Replit Auth não funciona fora do Replit.

**Solução:**
- Foi criado um sistema de login local automático
- Apenas acesse: http://localhost:3000/api/login
- Um usuário admin de teste será criado automaticamente
- Você será redirecionado já logado

### "ECONNREFUSED" - Frontend não conecta com Backend
**Causa mais comum:** Backend não iniciou antes do frontend

**Solução:**
1. **SEMPRE iniciar backend primeiro:**
   ```bash
   # Terminal 1 - Backend
   npm run server:dev
   # Aguarde: "[express] serving on port 5000"
   ```

2. **Depois iniciar frontend:**
   ```bash
   # Terminal 2 - Frontend  
   npm run client:dev
   ```

3. **Se ainda der erro:**
   ```bash
   # Verificar se porta 5000 está em uso
   netstat -ano | findstr :5000  # Windows
   lsof -i :5000                 # Mac/Linux
   ```

### "Port 5000 already in use"
```bash
# Encontrar processo usando a porta
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux

# Finalizar processo
taskkill /PID <número> /F     # Windows  
kill -9 <número>              # macOS/Linux

# Ou use outra porta no .env
PORT=3001
```

## ✅ Comandos para Testar se Está Funcionando

### 1. Testar Instalação
```bash
npm --version
node --version
npm list @neondatabase/serverless
```

### 2. Testar Banco de Dados
```bash
npm run db:push
```

### 3. Testar Aplicação
```bash
npm run dev
```

## 🔧 Configuração Completa Passo a Passo

Se nada funcionou, faça uma instalação limpa:

```bash
# 1. Certificar que os arquivos estão renomeados
mv package-local.json package.json
mv vite.config.local.ts vite.config.ts

# 2. Limpar tudo
rm -rf node_modules package-lock.json

# 3. Instalar dependências
npm install

# 4. Criar .env (ajuste conforme sua configuração)
echo "DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/ubatuba_tourism" > .env
echo "OPENAI_API_KEY=sk-proj-sua-chave-aqui" >> .env
echo "SESSION_SECRET=string-super-secreta-aleatoria" >> .env

# 5. Configurar banco
npm run db:push

# 6. Executar
npm run dev
```

## 📞 Ainda com Problemas?

Se ainda estiver com dificuldades:

1. **Verifique se seguiu todos os passos** do LOCAL_SETUP.md
2. **Compartilhe o erro completo** - cole todo o log do erro
3. **Informe seu sistema**: Windows/Mac/Linux e versão do Node.js
4. **Verifique se os arquivos essenciais existem**:
   - package.json (não package-local.json)
   - vite.config.ts (não vite.config.local.ts)
   - .env com as variáveis corretas

O projeto foi testado e funciona! A maioria dos problemas são de configuração inicial que se resolvem seguindo estes passos.