# UbatubaIA - Aplicativo de Turismo para Ubatuba

Uma aplicação web completa de turismo para Ubatuba, SP, Brasil, com IA para roteiros personalizados, gestão de trilhas, praias, passeios e eventos, além de sistema multi-usuário.

## 🚀 Funcionalidades

- **IA Personalizada**: Geração de roteiros turísticos personalizados usando OpenAI GPT-4o
- **Gestão de Conteúdo**: Sistema completo para trilhas, praias, passeios de barco e eventos
- **Sistema Multi-usuário**: Turistas, guias, produtores de eventos e administradores
- **Painel Administrativo**: Interface para gestão completa do conteúdo
- **Autenticação**: Sistema de login integrado com Replit Auth
- **Design Responsivo**: Interface otimizada para mobile e desktop

## 🛠️ Tecnologias

### Frontend
- React 18 com TypeScript
- Vite para build e desenvolvimento
- Tailwind CSS + shadcn/ui para estilização
- Wouter para roteamento
- TanStack Query para gerenciamento de estado
- React Hook Form + Zod para formulários

### Backend
- Node.js + Express.js
- TypeScript
- Drizzle ORM para banco de dados
- PostgreSQL (Neon)
- Replit Auth (OpenID Connect)
- OpenAI API para IA

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL (ou acesso ao Neon Database)
- Conta OpenAI para API key
- Conta Replit para autenticação (opcional para desenvolvimento local)

## 🔧 Instalação Local

### 1. Clone o projeto
```bash
git clone <url-do-repositorio>
cd ubatuba-tourism-app
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ubatuba_tourism

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Session (gere uma string aleatória)
SESSION_SECRET=your-super-secret-session-key-here

# Replit Auth (opcional para desenvolvimento local)
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=localhost:5000
```

### 4. Configure o banco de dados
```bash
# Crie o banco de dados PostgreSQL
createdb ubatuba_tourism

# Execute as migrações
npm run db:push

# Popule com dados de exemplo (opcional)
npm run dev # Na primeira execução, dados de exemplo serão criados
```

### 5. Execute o projeto
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5000`

## 📁 Estrutura do Projeto

```
ubatuba-tourism-app/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilitários
│   │   └── pages/          # Páginas da aplicação
├── server/                 # Backend Express
│   ├── db.ts              # Configuração do banco
│   ├── routes.ts          # Rotas da API
│   ├── storage.ts         # Camada de dados
│   ├── openai.ts          # Integração OpenAI
│   └── replitAuth.ts      # Autenticação
├── shared/                # Código compartilhado
│   └── schema.ts          # Schemas do banco de dados
└── components.json        # Configuração shadcn/ui
```

## 🔐 Sistema de Usuários

### Tipos de Usuário
- **Tourist** (padrão): Pode gerar roteiros e visualizar conteúdo
- **Guide**: Pode criar perfis de guia
- **Event Producer**: Pode criar eventos
- **Admin**: Pode gerenciar todo o conteúdo

### Tornando-se Admin
Para tornar um usuário administrador, execute no banco de dados:
```sql
UPDATE users SET user_type = 'admin' WHERE email = 'seu-email@exemplo.com';
```

## 🎯 Principais Funcionalidades

### Para Turistas
- Geração de roteiros personalizados com IA
- Exploração de trilhas, praias e passeios
- Visualização de eventos locais
- Contato com guias turísticos

### Para Administradores
- Painel administrativo completo
- Gestão de trilhas, praias, passeios, eventos e guias
- Criação e edição de conteúdo
- Monitoramento da plataforma

## 🚀 Deploy

### Replit (Recomendado)
1. Importe o projeto no Replit
2. Configure as variáveis de ambiente
3. Execute `npm run dev`

### Outros Provedores
1. Configure PostgreSQL
2. Defina as variáveis de ambiente
3. Execute `npm run build` para produção
4. Inicie com `npm start`

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run db:push      # Sincronizar schema com banco
npm run db:generate  # Gerar migrações
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique se o banco de dados está rodando
4. Consulte os logs do servidor para erros específicos

## 🌟 Recursos Avançados

- **Busca Semântica**: Integração com OpenAI para busca inteligente
- **Geolocalização**: Mapas interativos (futuro)
- **Pagamentos**: Integração com Stripe (futuro)
- **Chat em Tempo Real**: WebSocket para comunicação (futuro)
- **PWA**: Aplicativo web progressivo (futuro)