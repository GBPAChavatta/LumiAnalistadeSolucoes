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
5. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_API_URL` = URL do backend Render (ex: `https://lumi-backend.onrender.com`)
   - Opcional (para leads direto no Supabase):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Clique em **Deploy**.

---

## 3. Atualizar CORS no backend

Depois que o frontend estiver publicado, edite o backend no Render e defina:

```
CORS_ORIGINS=https://seu-projeto.vercel.app
```

Ou, para aceitar múltiplas origens: `https://app1.vercel.app,https://app2.vercel.app`

---

## 4. Checklist

- [ ] Backend publicado no Render e respondendo em `/health`
- [ ] Frontend publicado na Vercel
- [ ] `NEXT_PUBLIC_API_URL` apontando para o backend
- [ ] `CORS_ORIGINS` inclui a URL do frontend
- [ ] Política RLS do Supabase configurada (se usar leads direto)

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
