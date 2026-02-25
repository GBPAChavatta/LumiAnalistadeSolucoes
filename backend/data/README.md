# Estrutura de Dados

Esta pasta contém todos os dados gerados pela aplicação.

## Estrutura

```
data/
├── leads.csv                    # Registro de todos os leads cadastrados
├── transcripts/                 # Transcrições STT por lead
│   └── {email_sanitizado}/     # Pasta por lead (email com @ e . substituídos)
│       ├── {timestamp}_user.txt
│       └── {timestamp}_agent.txt
└── audio/                       # Áudios TTS por lead
    └── {email_sanitizado}/      # Pasta por lead
        ├── {timestamp}_agent_{eventId}.mp3
        └── {timestamp}_user_{eventId}.mp3
```

## Formato dos Arquivos

### leads.csv
CSV com cabeçalhos: `id,timestamp,nome,email,telefone,empresa`

### Transcrições (.txt)
Formato:
```
Timestamp: {ISO timestamp}
Speaker: user|agent
Text: {texto transcrito}
```

### Áudios (.mp3)
Áudio convertido para MP3 (128kbps) a partir de PCM 16-bit
- Agente: 24kHz original
- Usuário: 16kHz original

## Notas

- Os arquivos `.gitkeep` mantêm as pastas no repositório Git
- Os arquivos de dados reais são ignorados pelo `.gitignore`
- Cada lead tem sua própria pasta organizada por email sanitizado
