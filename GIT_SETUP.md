# Configuração Git - UbatubaIA

## 🚀 Setup Inicial do Git

### 1. Inicializar Repositório
```bash
# Na pasta do projeto
git init
git branch -M main
```

### 2. Configurar Git (se ainda não fez)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 3. Adicionar Arquivos e Fazer Primeiro Commit
```bash
# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "feat: projeto inicial UbatubaIA com autenticação local"
```

## 📁 Arquivos Importantes para Sincronizar

### ✅ Incluir no Git:
- `server/` - Código do backend
- `client/` - Código do frontend  
- `shared/` - Schemas compartilhados
- `*.md` - Documentação
- `package.json` - Dependências
- `vite.config.ts` - Configuração Vite
- `tsconfig.json` - Configuração TypeScript
- `tailwind.config.ts` - Configuração Tailwind
- `drizzle.config.ts` - Configuração banco

### ❌ NÃO incluir no Git:
- `.env` - Chaves secretas
- `node_modules/` - Dependências instaladas
- `dist/` - Arquivos compilados
- `.replit` - Configurações do Replit

## 🔗 Conectar com GitHub/GitLab

### GitHub:
```bash
# Criar repositório no GitHub primeiro, depois:
git remote add origin https://github.com/seuusuario/ubatuba-tourism.git
git push -u origin main
```

### GitLab:
```bash
git remote add origin https://gitlab.com/seuusuario/ubatuba-tourism.git
git push -u origin main
```

## 🔄 Workflow de Sincronização

### Para Enviar Mudanças:
```bash
# 1. Ver status das mudanças
git status

# 2. Adicionar arquivos modificados
git add .
# OU adicionar arquivo específico
git add server/routes.ts

# 3. Commit com mensagem descritiva
git commit -m "feat: adicionar sistema de autenticação local"

# 4. Enviar para repositório remoto
git push
```

### Para Baixar Mudanças:
```bash
# Baixar últimas mudanças
git pull

# Se houver conflitos, resolver e depois:
git add .
git commit -m "resolve: conflitos de merge"
git push
```

## 📝 Convenções de Commit

Use prefixos para organizar commits:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Mudanças de estilo/formatação
- `refactor:` - Refatoração de código
- `test:` - Testes
- `chore:` - Tarefas de manutenção

**Exemplos:**
```bash
git commit -m "feat: adicionar página de praias"
git commit -m "fix: corrigir erro de conexão com banco"
git commit -m "docs: atualizar README com instruções"
```

## 🌿 Trabalhando com Branches

### Criar Branch para Nova Funcionalidade:
```bash
# Criar e mudar para nova branch
git checkout -b feature/sistema-pagamento

# Trabalhar normalmente...
git add .
git commit -m "feat: implementar integração com Stripe"

# Enviar branch para remoto
git push -u origin feature/sistema-pagamento
```

### Merge de Branch:
```bash
# Voltar para main
git checkout main

# Fazer merge
git merge feature/sistema-pagamento

# Enviar para remoto
git push

# Deletar branch local (opcional)
git branch -d feature/sistema-pagamento
```

## 🔐 Proteger Informações Sensíveis

### Arquivo .env (NUNCA commitar):
```env
# Este arquivo NÃO vai para o Git
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SESSION_SECRET=...
```

### Criar .env.example (commitar este):
```env
# Arquivo de exemplo - commitar este
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_banco
OPENAI_API_KEY=sua_chave_openai_aqui
SESSION_SECRET=sua_chave_secreta_longa_aqui
NODE_ENV=development
```

## 📋 Comandos Úteis

```bash
# Ver histórico de commits
git log --oneline

# Ver diferenças não commitadas
git diff

# Desfazer último commit (mantém arquivos)
git reset --soft HEAD~1

# Ver branches
git branch -a

# Trocar de branch
git checkout nome-da-branch

# Criar e trocar de branch
git checkout -b nova-branch

# Status do repositório
git status
```

## 🚨 Recuperação de Emergência

### Se perdeu arquivos:
```bash
# Voltar arquivo específico
git checkout -- nome-do-arquivo

# Voltar todos os arquivos para último commit
git checkout .
```

### Se commit errado:
```bash
# Desfazer último commit mantendo mudanças
git reset --soft HEAD~1

# Desfazer último commit perdendo mudanças (cuidado!)
git reset --hard HEAD~1
```

## 📱 Sincronização Entre Dispositivos

1. **Dispositivo A** (ex: computador casa):
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push
   ```

2. **Dispositivo B** (ex: laptop):
   ```bash
   git pull  # Baixa as mudanças
   # Continuar trabalhando...
   ```

## ✅ Checklist de Setup Git

- [ ] `git init` executado
- [ ] `.gitignore` configurado
- [ ] Primeiro commit feito
- [ ] Repositório remoto conectado
- [ ] `.env.example` criado
- [ ] `.env` adicionado ao .gitignore
- [ ] Push inicial realizado

**Dica**: Sempre faça `git pull` antes de começar a trabalhar e `git push` ao terminar!