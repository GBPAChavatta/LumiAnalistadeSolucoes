# ElevenLabs AgentAI com Supressor de Ruídos

Interface web completa para conversação com AgentAI da ElevenLabs, implementando STT (Speech-to-Text) com supressor de ruídos, LLM e TTS (Text-to-Speech), incluindo botão push-to-talk.

## Arquitetura

- **Frontend**: Next.js 14 com React 18 e TypeScript
- **Backend**: Python FastAPI para gerenciamento de tokens e signed URLs
- **SDK**: @elevenlabs/react para captura de áudio com noise suppression

## Estrutura do Projeto

```
Lumi-ElevenLabs-Supressao/
├── frontend/          # Aplicação Next.js
├── backend/           # API FastAPI
├── README.md
└── .gitignore
```

## Configuração

### Backend

1. Navegue até o diretório do backend:
```bash
cd backend
```

2. Crie um ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Crie o arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

5. Edite o `.env` com suas credenciais:
```
ELEVENLABS_API_KEY=your_api_key_here
AGENT_ID=your_agent_id_here
CORS_ORIGINS=http://localhost:3000
```

6. Execute o servidor:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend

1. Navegue até o diretório do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie o arquivo `.env.local` baseado no `.env.local.example`:
```bash
cp .env.local.example .env.local
```

4. Edite o `.env.local` se necessário (o padrão já está configurado):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse a aplicação em `http://localhost:3000`

## Como Usar

1. **Inicie o backend** (porta 8000)
2. **Inicie o frontend** (porta 3000)
3. **Acesse** `http://localhost:3000`
4. **Clique em "Conectar ao Agente"** para estabelecer conexão WebSocket
5. **Pressione e segure** o botão "Pressione para falar" para gravar
6. **Solte o botão** para enviar o áudio ao agente
7. **Aguarde** a resposta em texto e áudio

## Funcionalidades

### Supressor de Ruídos
O supressor de ruídos é configurado automaticamente usando o SDK `@elevenlabs/react` com as seguintes configurações:
- `echoCancellation: true`
- `noiseSuppression: true`

**Referência**: [ElevenLabs STT Streaming Docs](https://elevenlabs.io/docs/developers/guides/cookbooks/speech-to-text/streaming#configure-the-sdk)

### Push-to-Talk
- Botão que captura áudio apenas quando pressionado
- Feedback visual durante gravação
- Suporte para mouse e touch devices

### Transcrições em Tempo Real
- Exibição de transcrições parciais (enquanto fala)
- Transcrições finais após commit
- Histórico completo da conversação

### Reprodução de Áudio
- Reprodução automática das respostas do agente
- Queue management para evitar sobreposição
- Feedback visual durante reprodução

## Boas Práticas Implementadas

### Segurança
- ✅ API key nunca exposta no cliente
- ✅ Tokens single-use para STT
- ✅ Signed URLs para Conversational AI
- ✅ CORS configurado no backend

### Performance
- ✅ Chunks de áudio otimizados (0.1-1 segundo)
- ✅ Sample rate de 16kHz para melhor balance
- ✅ Jitter buffer para áudio de resposta

### Confiabilidade
- ✅ Reconexão automática com exponential backoff
- ✅ Tratamento de erros robusto
- ✅ Ping/pong para manter conexão viva

### UX
- ✅ Feedback visual claro de estados
- ✅ Transcrições em tempo real
- ✅ Indicadores de conexão e gravação

## Dependências Adicionais

### Backend - Conversão de Áudio para MP3

Para salvar áudios em formato MP3, é necessário ter o **ffmpeg** instalado:

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows:**
Baixe de https://ffmpeg.org/download.html e adicione ao PATH

**Nota:** Se o ffmpeg não estiver disponível, os áudios serão salvos como WAV ou PCM como fallback automaticamente.

## Referências

- [ElevenLabs STT Streaming Documentation](https://elevenlabs.io/docs/developers/guides/cookbooks/speech-to-text/streaming)
- [ElevenLabs Conversational AI WebSocket](https://elevenlabs.io/docs/conversational-ai/libraries/web-sockets)
- [ElevenLabs React SDK](https://elevenlabs.io/docs/developers/resources/libraries)
- [pydub Documentation](https://github.com/jiaaro/pydub)

## Troubleshooting

### Erro ao obter token
- Verifique se o backend está rodando na porta 8000
- Confirme que `ELEVENLABS_API_KEY` está configurado corretamente
- Verifique os logs do backend para mais detalhes

### Erro ao conectar WebSocket
- Verifique se `AGENT_ID` está configurado no backend
- Confirme que o agente existe na sua conta ElevenLabs
- Verifique se a API key tem permissões adequadas

### Áudio não está sendo capturado
- Verifique permissões do microfone no navegador
- Confirme que está usando HTTPS ou localhost (requisito do navegador)
- Verifique os logs do console do navegador

## Licença

Este projeto é fornecido como está, para fins educacionais e de desenvolvimento.
