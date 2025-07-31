# Autorização de Domínio Firebase

## Status Atual
O sistema Firebase está configurado e funcionando tecnicamente. Os usuários estão sendo criados no banco de dados quando testamos via API.

## Próximo Passo Obrigatório
Para que o login via Google funcione no navegador, você precisa adicionar este domínio nas configurações do Firebase Console:

**Domínio a adicionar:**
```
3a5201b4-dbba-46f8-a5d9-c4b3536c5cff-00-7xoqnqhns8l9.janeway.replit.dev
```

## Como Adicionar no Firebase Console
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá para seu projeto "ubatuba-guias"
3. No menu lateral, clique em "Authentication"
4. Vá na aba "Settings" 
5. Role até "Authorized domains"
6. Clique em "Add domain"
7. Cole o domínio acima e salve

## Como Testar Após Adicionar o Domínio
1. Acesse a aplicação no navegador
2. Clique em "Entrar" ou "Criar Roteiro com IA"
3. Faça login com sua conta Google
4. Você deve ser redirecionado automaticamente para:
   - `/profile-selection` se é primeira vez
   - `/home` se já tem perfil completo

## Logs do Sistema
O sistema está logando todas as ações no console do navegador:
- "AuthProvider inicializando..."
- "Estado de autenticação mudou: [email]"
- "Usuário sincronizado: [dados]"
- "Redirecionando para: [destino]"

Todos os componentes estão funcionando corretamente, apenas aguardando a autorização do domínio.