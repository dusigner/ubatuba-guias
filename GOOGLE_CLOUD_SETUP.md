# Google Cloud Console Setup - Solução para auth/internal-error

## Problema Identificado
O erro `auth/internal-error` persiste mesmo com:
- ✅ Domínios autorizados corretos no Firebase
- ✅ Credenciais Firebase válidas
- ✅ Configuração do projeto correta

## Possível Causa
O problema pode estar no **Google Cloud Console** onde as configurações OAuth podem estar restritivas ou incorretas.

## Passos para Resolver

### 1. Acessar Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto: `ubatuba-guias`

### 2. Verificar APIs Habilitadas
1. No menu lateral, vá para **APIs e Serviços** > **Biblioteca**
2. Procure e verifique se estão habilitadas:
   - ✅ Identity and Access Management (IAM) API
   - ✅ Google+ API (se necessário)
   - ✅ Identity Toolkit API

### 3. Configurar OAuth 2.0
1. Vá para **APIs e Serviços** > **Credenciais**
2. Encontre as credenciais OAuth 2.0 para aplicações web
3. Clique para editar
4. Adicione aos **URIs de redirecionamento autorizados**:
   - `https://3a5201b4-dbba-46f8-a5d9-c4b3536c5cff-00-7xoqnqhns8l9.janeway.replit.dev`
   - `https://ubatuba-guias.firebaseapp.com/__/auth/handler`
5. Adicione às **Origens JavaScript autorizadas**:
   - `https://3a5201b4-dbba-46f8-a5d9-c4b3536c5cff-00-7xoqnqhns8l9.janeway.replit.dev`

### 4. Verificar Tela de Consentimento OAuth
1. Vá para **APIs e Serviços** > **Tela de consentimento OAuth**
2. Certifique-se de que:
   - Status está **Publicado** (não em teste)
   - Domínios estão adicionados aos **Domínios autorizados**
   - Escopos incluem: `email`, `profile`, `openid`

### 5. Reinicializar Firebase Auth
Se as configurações estiverem corretas, pode ser necessário:
1. Desabilitar temporariamente o método Google no Firebase Console
2. Aguardar alguns minutos
3. Reabilitar o método Google
4. Testar novamente

## URLs Importantes
- Firebase Console: https://console.firebase.google.com/project/ubatuba-guias
- Google Cloud Console: https://console.cloud.google.com/
- Credenciais: https://console.cloud.google.com/apis/credentials

## Próximos Passos
1. Verificar configurações OAuth no Google Cloud Console
2. Confirmar URIs de redirecionamento
3. Verificar status da tela de consentimento
4. Testar login após ajustes