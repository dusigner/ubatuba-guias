# 🔥 Firebase Setup - UbatubaIA

## Configuração e Deploy no Firebase

### 1. Pré-requisitos
- Conta Google ativa
- Node.js 18+ instalado
- Firebase CLI instalado: `npm install -g firebase-tools`

### 2. Configuração do Firebase Console

#### 2.1 Criar Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Add project" / "Adicionar projeto"
3. Nome do projeto: `ubatuba-tourism` (ou outro de sua escolha)
4. Ative Google Analytics (opcional)
5. Clique em "Create project"

#### 2.2 Configurar Authentication
1. No painel do projeto, vá em **Authentication**
2. Clique em "Get started"
3. Na aba **Sign-in method**:
   - Ative **Google** provider
   - Configure domínios autorizados (adicione seu domínio de produção)
   - Salve as configurações

#### 2.3 Configurar Hosting
1. No painel do projeto, vá em **Hosting**
2. Clique em "Get started"
3. Siga o wizard de configuração

#### 2.4 Obter Chaves de Configuração
1. No painel do projeto, clique no ícone de engrenagem ⚙️
2. Vá em **Project settings**
3. Na seção **Your apps**, clique em **Web app** (</>)
4. Registre o app com nome: `UbatubaIA Web`
5. **Copie as chaves de configuração:**
   - `apiKey`
   - `projectId` 
   - `appId`

### 3. Configuração Local

#### 3.1 Instalar Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### 3.2 Configurar Projeto
```bash
# Navegar para o projeto
cd ubatuba-tourism-app

# Usar configuração Firebase
mv package-firebase.json package.json

# Instalar dependências
npm install

# Inicializar Firebase
firebase init

# Selecionar:
# - Hosting: Configure files for Firebase Hosting
# - Functions: Configure a Cloud Functions directory and its files
# - Escolher projeto existente criado no passo 2.1
```

#### 3.3 Configurar Variáveis de Ambiente
Crie arquivo `.env`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_PROJECT_ID=seu_project_id_aqui  
VITE_FIREBASE_APP_ID=seu_app_id_aqui

# Database (use Firebase Firestore ou mantenha PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:port/db

# Google Gemini API
GOOGLE_GENAI_API_KEY=sua_chave_gemini

# Session
SESSION_SECRET=sua_string_secreta_aleatoria
```

### 4. Estrutura para Deploy

```
ubatuba-tourism-app/
├── firebase.json          # Configuração Firebase
├── .env                   # Variáveis de ambiente (local)
├── dist/                  # Build de produção
│   ├── public/           # Frontend buildado
│   └── index.js          # Backend buildado
├── client/               # Frontend React
├── server/               # Backend Express
└── shared/               # Código compartilhado
```

### 5. Build e Deploy

#### 5.1 Build para Produção
```bash
# Build completo
npm run build

# Verificar build local
npm run preview
```

#### 5.2 Deploy no Firebase
```bash
# Deploy hosting + functions
npm run firebase:deploy

# Ou usar Firebase CLI diretamente
firebase deploy
```

#### 5.3 Configurar Domínio (Opcional)
1. No Firebase Console, vá em **Hosting**
2. Clique em "Add custom domain"
3. Siga as instruções para configurar DNS

### 6. Configurações de Produção

#### 6.1 Variáveis de Ambiente no Firebase
```bash
# Configurar secrets no Firebase Functions
firebase functions:config:set \
  database.url="postgresql://user:pass@host:port/db" \
  gemini.api_key="sua_chave_gemini" \
  session.secret="sua_string_secreta"

# Deploy após configurar
firebase deploy --only functions
```

#### 6.2 Domínios Autorizados
No Firebase Authentication > Settings > Authorized domains:
- `seu-projeto.web.app` (domínio Firebase)
- `seu-dominio-customizado.com` (se usar domínio próprio)
- `localhost` (para desenvolvimento)

### 7. URLs de Produção

Após deploy bem-sucedido:
- **App**: `https://seu-projeto.web.app`
- **Console**: `https://console.firebase.google.com/project/seu-projeto`
- **Analytics**: Disponível no Firebase Console

### 8. Monitoramento

#### 8.1 Logs
```bash
# Ver logs das functions
firebase functions:log

# Ver logs específicos
firebase functions:log --only=api
```

#### 8.2 Performance
- Monitore no Firebase Console > Performance
- Analytics automático para usuários
- Crashlytics para erros de frontend

### 9. Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview local
npm run preview

# Deploy
npm run firebase:deploy

# Serve localmente (produção)
npm run firebase:serve

# Ver logs
firebase functions:log

# Configurar domínio
firebase hosting:channel:deploy preview
```

### 10. Troubleshooting

#### Erro de CORS
Adicionar no `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "/api/**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      }
    ]
  }
}
```

#### Erro de Authentication
- Verificar domínios autorizados
- Confirmar chaves de configuração
- Verificar regras de segurança

#### Erro de Database
- Confirmar connection string
- Verificar se banco está acessível pela internet
- Considerar migrar para Firebase Firestore

---

**🚀 Projeto pronto para produção no Firebase!**

O Firebase oferece:
- ✅ Hosting global com CDN
- ✅ Authentication integrada
- ✅ SSL automático
- ✅ Analytics integrado
- ✅ Monitoramento e logs
- ✅ Escalabilidade automática