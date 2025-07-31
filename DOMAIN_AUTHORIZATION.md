# 🔐 Como Autorizar Domínio no Firebase

## Problema
Erro: `auth/unauthorized-domain` - significa que o domínio atual não está autorizado para usar Firebase Authentication.

## Solução Rápida

### 1. Domínio Atual do Replit
```
3a5201b4-dbba-46f8-a5d9-c4b3536c5cff-00-7xoqnqhns8l9.janeway.replit.dev
```

### 2. Passos no Firebase Console

1. **Acesse o Firebase Console:**
   - Vá em: https://console.firebase.google.com/
   - Selecione o projeto: `ubatuba-guias`

2. **Vá em Authentication:**
   - Menu lateral → "Authentication"
   - Clique na aba "Settings" (Configurações)

3. **Adicione o Domínio:**
   - Procure por "Authorized domains" (Domínios autorizados)
   - Clique em "Add domain" (Adicionar domínio)
   - Cole: `3a5201b4-dbba-46f8-a5d9-c4b3536c5cff-00-7xoqnqhns8l9.janeway.replit.dev`
   - Clique em "Done"

### 3. Domínios Recomendados
Adicione também estes domínios para desenvolvimento e produção:

```
localhost
127.0.0.1
3a5201b4-dbba-46f8-a5d9-c4b3536c5cff-00-7xoqnqhns8l9.janeway.replit.dev
ubatuba-guias.web.app (domínio Firebase)
seu-dominio-customizado.com (se tiver)
```

### 4. Teste
Depois de adicionar o domínio:
1. Aguarde 1-2 minutos para propagação
2. Recarregue a página do app
3. Teste o login novamente

## Screenshots de Referência

### Localização no Firebase Console:
```
Firebase Console > Projeto > Authentication > Settings > Authorized domains
```

### Como deve ficar:
```
✅ localhost
✅ 3a5201b4-dbba-46f8-a5d9-c4b3536c5cff-00-7xoqnqhns8l9.janeway.replit.dev
✅ ubatuba-guias.firebaseapp.com
```

## Observações Importantes

- **Sem HTTPS**: Firebase Authentication requer HTTPS em produção, mas funciona com HTTP em localhost
- **Domínio Dinâmico**: Domínios Replit podem mudar, então pode precisar atualizar periodicamente
- **Deploy**: Quando fizer deploy no Firebase Hosting, adicione também o domínio `.web.app`

## Solução de Problemas

### Se ainda não funcionar:
1. Limpe o cache do navegador
2. Verifique se digitou o domínio corretamente
3. Aguarde alguns minutos para propagação
4. Tente em janela anônima/privada

### Domínio mudou?
Se o Replit gerar novo domínio, atualize no Firebase Console seguindo os mesmos passos.