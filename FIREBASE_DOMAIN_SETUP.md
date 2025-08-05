# Firebase Domain Authorization Setup

## Problema Identificado
O erro `auth/internal-error` indica que o domínio atual não está autorizado no Firebase Console.

## Domínio Atual
- **Replit Dev Domain**: `3a5201b4-dbba-46f8-a5d9-c4b3536c5cff-00-7xoqnqhns8l9.janeway.replit.dev`

## Solução - Autorizar Domínio no Firebase

### 1. Acessar o Firebase Console
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto: `ubatuba-guias`

### 2. Configurar Domínios Autorizados
1. No menu lateral, clique em **Authentication**
2. Vá para a aba **Settings** (Configurações)
3. Role até a seção **Authorized domains** (Domínios autorizados)
4. Clique em **Add domain** (Adicionar domínio)
5. Adicione: `3a5201b4-dbba-46f8-a5d9-c4b3536c5cff-00-7xoqnqhns8l9.janeway.replit.dev`
6. Clique em **Save** (Salvar)

### 3. Domínios Necessários
Para funcionar completamente, adicione:
- `localhost` (para desenvolvimento local)
- `3a5201b4-dbba-46f8-a5d9-c4b3536c5cff-00-7xoqnqhns8l9.janeway.replit.dev` (Replit atual)
- `*.replit.app` (para deployments futuros)
- Seu domínio customizado (se houver)

### 4. Verificar Configuração
Após adicionar os domínios, aguarde alguns minutos e teste novamente o login.

## Status Atual
❌ Domínio não autorizado - necessita configuração manual no Firebase Console
⚠️ Login falhará até que o domínio seja adicionado aos domínios autorizados

## Como Identificamos o Problema
- Erro `auth/internal-error` é específico de domínio não autorizado
- Console logs mostram tentativas de login falhando consistentemente
- Firebase rejeita requisições de domínios não autorizados por segurança