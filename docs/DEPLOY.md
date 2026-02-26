# Guia de publicação - Lumi

## Visão geral

- **Frontend**: Vercel (Next.js)
- **Backend**: Render (FastAPI)

---

## 1. Publicar o Backend no Render

1. Acesse [render.com](https://render.com) e faça login (ou crie conta).
2. Clique em **New** → **Web Service**.
3. Conecte seu repositório GitHub (Lumi-ElevenLabs-Supressao).
4. Configurações:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Em **Environment**, adicione:
   - `ELEVENLABS_API_KEY` = sua chave ElevenLabs
   - `AGENT_ID` = ID do agente (ex: `agent_xxx`)
   - `DATABASE_URL` = URL PostgreSQL (Supabase)
   - `CORS_ORIGINS` = URL do frontend (ex: `https://seu-projeto.vercel.app`)
6. Clique em **Create Web Service**.
7. Copie a URL do serviço (ex: `https://lumi-backend.onrender.com`).

---

## 2. Publicar o Frontend na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **Add New** → **Project**.
3. Importe o repositório GitHub.
4. Configurações:
   - **Root Directory**: `frontend` (ou deixe e use o `vercel.json` na raiz)
   - **Framework Preset**: Next.js
5. Em **Environment Variables** (Vercel):
   - `NEXT_PUBLIC_API_URL` = `https://lumianalistadesolucoes.onrender.com` (já em .env.production; Vercel sobrescreve se definido)
   - **Supabase (para leads direto no frontend):** defina na Vercel:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` se usar integração Vercel+Supabase)
   - **Importante:** variáveis `NEXT_PUBLIC_*` são embutidas no build. Qualquer alteração exige novo deploy. Use **Redeploy → Clear build cache** para garantir que as vars sejam aplicadas.
   - Para a página **Consulta de Leads** (Google OAuth):
     - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (ver [CONSULTA_LEADS_SETUP.md](CONSULTA_LEADS_SETUP.md))
     - `NEXTAUTH_SECRET` (obrigatório em produção: `openssl rand -base64 32`)
     - `NEXTAUTH_URL` = URL do frontend (ex: `https://seu-projeto.vercel.app`)
     - `NEXTAUTH_TRUST_HOST=true` (para preview deployments)
6. Clique em **Deploy**.

---

## 3. Atualizar CORS no backend

Depois que o frontend estiver publicado, edite o backend no Render e defina:

```
CORS_ORIGINS=https://seu-projeto.vercel.app
```

Ou, para aceitar múltiplas origens: `https://app1.vercel.app,https://app2.vercel.app`  
**Dica:** Use URLs sem barra final (ex: `https://seu-app.vercel.app`). O backend remove trailing slashes automaticamente.

## Ambientes dev e prod

| Ambiente | Backend | Frontend |
|----------|---------|----------|
| **Dev** | `http://localhost:8000` | `.env.development` / `npm run dev` |
| **Prod** | `https://lumianalistadesolucoes.onrender.com` | `.env.production` / Vercel |

O Next.js usa `.env.development` em `npm run dev` e `.env.production` no build de produção. **Ordem de prioridade:** variáveis da Vercel sobrescrevem `.env.production`. Em produção, prefira definir credenciais na Vercel, não em arquivos versionados. `.env.production` deve ter apenas defaults não sensíveis (ex.: URL da API).

---

## 4. Checklist

- [ ] Backend publicado no Render e respondendo em `/health`
- [ ] Frontend publicado na Vercel
- [ ] `NEXT_PUBLIC_API_URL` apontando para o backend
- [ ] `CORS_ORIGINS` inclui a URL do frontend
- [ ] Política RLS do Supabase configurada (ver [SUPABASE_RLS_LEADS.md](SUPABASE_RLS_LEADS.md))
- [ ] Se usar Consulta de Leads: `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e Redirect URI no Google Console (ver [CONSULTA_LEADS_SETUP.md](CONSULTA_LEADS_SETUP.md))

---

## Deploy via CLI (alternativa)

### Vercel (frontend)

```bash
npx vercel login    # Faça login na Vercel (abre o navegador)
cd frontend
npx vercel          # Primeiro deploy: segue o assistente
```

Quando perguntado, defina `NEXT_PUBLIC_API_URL` com a URL do backend (ex: `https://lumi-backend.onrender.com`).

### Render (backend)

Use o dashboard ou o [Render CLI](https://render.com/docs/cli) para conectar o repositório.

---

## Troubleshooting: Errno 101 (Network is unreachable)

O erro `[Errno 101] Network is unreachable` ocorre no **backend** (Render) ao tentar conectar ao Supabase PostgreSQL via `DATABASE_URL`. O frontend mostra isso quando usa o backend para registrar leads.

**Fluxo recomendado (evita o erro):** use Supabase diretamente no frontend definindo `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` na Vercel. Assim o fluxo de leads é frontend → Supabase, sem passar pelo backend.

**Se precisar que o backend use o banco:** investigue `DATABASE_URL` no Render (formato pooler vs conexão direta, IPv6 vs IPv4), verifique se o projeto Supabase está ativo (não pausado) e consulte os docs do Render sobre restrições de rede no plano free.
