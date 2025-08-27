# 🏖️ Ubatuba Guias - Plataforma de Turismo Inteligente

Sistema completo de turismo para Ubatuba/SP com geração de roteiros personalizados via IA, autenticação Firebase, e gestão de conteúdo para guias locais.

## ✨ Principais Funcionalidades

- 🤖 **Roteiros Personalizados com IA**: Geração inteligente usando Google Gemini
- 👥 **Sistema Multi-Usuário**: Turistas, guias, produtores de eventos, operadores de barco
- 🔐 **Autenticação Firebase**: Login seguro com Google
- 🏖️ **Catálogo Completo**: Trilhas, praias, eventos e passeios de barco
- 📱 **Interface Responsiva**: Design adaptado para todos os dispositivos
- 🛡️ **Segurança Avançada**: Proteção contra ataques cibernéticos

## 🛠️ Stack Tecnológico

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Banco**: PostgreSQL + Drizzle ORM
- **Autenticação**: Firebase Authentication
- **IA**: Google Gemini AI (gratuito)
- **Clima**: OpenWeather API

## 🚀 Como Executar Localmente

### Para Windows:
Consulte o arquivo `SETUP_WINDOWS.md` para instruções completas de instalação.

### Passos Rápidos:
```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env (veja .env.local.example)
cp .env.local.example .env
# Edite o .env com suas configurações

# 3. Configurar banco de dados
npm run db:push

# 4. Executar aplicação
npm run dev
```

## 🔧 Scripts Disponíveis

```bash
npm run dev         # Desenvolvimento
npm run build       # Build produção
npm run db:push     # Aplicar schema do banco
npm run db:studio   # Interface visual do banco
```

## 🎯 Tipos de Usuário

| Tipo | Funcionalidades |
|------|----------------|
| **Turista** | Gerar roteiros, explorar atrações, avaliar |
| **Guia Local** | Criar perfil, gerenciar tours, receber clientes |
| **Produtor de Eventos** | Cadastrar e gerenciar eventos |
| **Operador de Barco** | Gerenciar passeios marítimos |

## 🔒 Recursos de Segurança

✅ **Implementado**:
- Rate limiting (anti DDoS)
- Proteção XSS e SQL Injection
- Headers de segurança (Helmet)
- Validação de entrada (Zod)
- Autenticação Firebase
- Monitoramento de ataques
npm run dev

## 📂 Estrutura do Projeto

```
├── client/           # Frontend React
├── server/           # Backend Express
├── shared/           # Código compartilhado (schemas)
├── SETUP_WINDOWS.md  # Guia de instalação
├── SECURITY.md       # Relatório de segurança
└── .env.local.example # Exemplo de configuração
```

## 🌐 Deploy

O projeto está otimizado para deploy no Replit, mas pode ser executado em qualquer ambiente Node.js com PostgreSQL.

## 📞 Suporte

- Consulte `SETUP_WINDOWS.md` para instalação
- Veja `SECURITY.md` para questões de segurança
- Verifique logs de erro no console para troubleshooting