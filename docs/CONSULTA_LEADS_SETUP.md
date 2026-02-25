# Configuração da página Consulta de Leads

## Visão geral

A página `/consulta-leads` lista os leads cadastrados e permite marcar "Contato feito". O acesso é restrito a usuários com email `@gbpa.com.br` via Google OAuth.

## 1. Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um projeto ou selecione um existente.
3. Vá em **APIs & Services** → **Credentials**.
4. Clique em **Create Credentials** → **OAuth client ID**.
5. Tipo: **Web application**.
6. Em **Authorized redirect URIs**, adicione:
   - Desenvolvimento: `http://localhost:3000/api/auth/callback/google`
   - Produção: `https://seu-dominio.vercel.app/api/auth/callback/google`
   - Preview Vercel: `https://lumi-analistade-solucoes-git-main-gbpachavattas-projects.vercel.app/api/auth/callback/google` (ou a URL do seu preview)
7. Copie o **Client ID** e **Client Secret**.

## 2. Variáveis de ambiente

No `.env.local` (ou nas variáveis do Vercel):

```
GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=  # gere com: openssl rand -base64 32
```

Para produção na Vercel:

- **NEXTAUTH_SECRET** – obrigatório; sem ele o NextAuth retorna 500 em produção. Gere com: `openssl rand -base64 32`
- **NEXTAUTH_URL** – use `https://seu-dominio.vercel.app` (produção) ou deixe em branco se usar apenas previews
- **trustHost** – já configurado no código para aceitar URLs dinâmicas de preview da Vercel (ex.: `lumi-analistade-solucoes-git-main-...vercel.app`)

Para preview deployments: adicione em **Authorized redirect URIs** no Google Console cada URL de preview que for usar, ex.:  
`https://lumi-analistade-solucoes-git-main-gbpachavattas-projects.vercel.app/api/auth/callback/google`

## 3. Restrição de domínio

Apenas emails `@gbpa.com.br` podem acessar. Isso é validado no callback `signIn` do NextAuth.

## 4. Backend

O endpoint `/api/leads/list` e `PATCH /api/leads/{id}/contato-feito` precisam estar disponíveis. Garanta que `NEXT_PUBLIC_API_URL` aponte para o backend em produção (ver [DEPLOY.md](DEPLOY.md)).

## 5. Coluna contato_feito

O backend adiciona automaticamente a coluna `contato_feito` na tabela `leads` ao iniciar. Se a tabela já existir no Supabase, a migração roda na primeira conexão.
