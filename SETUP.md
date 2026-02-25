# Guia Rápido de Setup

## Pré-requisitos

- Python 3.8+
- Node.js 18+
- Conta ElevenLabs com API key
- Agent ID de um agente criado no ElevenLabs

## Setup Rápido

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Instalar ffmpeg (necessário para conversão MP3)
# macOS:
brew install ffmpeg
# Linux:
# sudo apt-get update && sudo apt-get install ffmpeg

cp .env.example .env
# Edite .env com suas credenciais
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edite .env.local se necessário (padrão já está correto)
npm run dev
```

### 3. Acesse

Abra `http://localhost:3000` no navegador.

## Configuração do .env (Backend)

```env
ELEVENLABS_API_KEY=seu_api_key_aqui
AGENT_ID=seu_agent_id_aqui
CORS_ORIGINS=http://localhost:3000
```

## Obter Credenciais

1. **API Key**: https://elevenlabs.io/app/settings/api-keys
2. **Agent ID**: Crie um agente em https://elevenlabs.io/app/agents e copie o ID da URL ou das configurações

## Testando

1. Inicie o backend (porta 8000)
2. Inicie o frontend (porta 3000)
3. Clique em "Conectar ao Agente"
4. Pressione e segure "Pressione para falar"
5. Fale algo e solte o botão
6. Aguarde a resposta do agente

## Troubleshooting

### Erro ao obter token
- Verifique se o backend está rodando
- Confirme que `ELEVENLABS_API_KEY` está correto no `.env`

### Erro ao conectar WebSocket
- Verifique se `AGENT_ID` está configurado
- Confirme que o agente existe na sua conta

### Microfone não funciona
- Verifique permissões do navegador
- Use HTTPS ou localhost (requisito do navegador)

## Documentação completa

- **Deploy** (Vercel + Render): [docs/DEPLOY.md](docs/DEPLOY.md)
- **Consulta de Leads** (Google OAuth): [docs/CONSULTA_LEADS_SETUP.md](docs/CONSULTA_LEADS_SETUP.md)
- **Agente ElevenLabs**: [docs/AGENT_ELEVENLABS_SETUP.md](docs/AGENT_ELEVENLABS_SETUP.md)
- **Supabase RLS** (leads): [docs/SUPABASE_RLS_LEADS.md](docs/SUPABASE_RLS_LEADS.md)
