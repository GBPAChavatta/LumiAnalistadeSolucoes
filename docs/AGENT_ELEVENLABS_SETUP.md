# Configuração do agente Lumi na ElevenLabs

Este guia descreve como criar e configurar o agente conversacional na ElevenLabs com foco em **pt-BR**, **voz feminina**, **modelo v3**, **Knowledge Base (RAG)** e restrições de contexto (sem internet, apenas desafio da empresa).

---

## 1. Criar o agente

1. Acesse [ElevenLabs → Conversational AI → Agents](https://elevenlabs.io/app/agents/agents).
2. Clique em **Create Agent**.
3. Dê um nome ao agente (ex.: **Lumi**).

---

## 2. Voz (pt-BR feminina)

- Em **Voice**, escolha uma voz feminina adequada para **português do Brasil**.
- Sugestões na Voice Library (busque por "Portuguese" ou "Brazilian"):
  - **Rachel** – clara e profissional  
  - **Michelle** – jovem, brasileira (ID: `OB6x7EbXYlhG4DDTB1XU` se disponível)  
  - **Yasmin Alves** – leve e musical  
  - **Carla** ou **Scheila** – também listadas para português  

Teste no player da ElevenLabs e escolha a que melhor combina com a marca.

---

## 3. Modelo LLM (v3)

- Em **Model** (ou **LLM**), selecione um modelo de última geração (“v3”):
  - **GPT-4o** ou **GPT-4.1** (OpenAI)  
  - **Gemini 2.0 Flash** ou **Gemini 2.5 Flash** (Google)  
  - **Claude 3.5 Sonnet** ou **Claude 3.7 Sonnet** (Anthropic)  

Recomendação: **GPT-4o** ou **Gemini 2.0 Flash** para bom equilíbrio entre qualidade e custo em pt-BR.

---

## 4. Idioma

- Defina **Language** como **Portuguese (Brazil)** ou **pt-BR**, se a opção existir.

---

## 5. Primeira mensagem (saudação)

- Em **First message** (ou **Greeting**), configure a mensagem padrão:

```text
Olá, qual desafio posso te ajudar a resolver hoje?
```

**Opção 1: Mensagem simples (recomendado)**
- Use a mensagem acima. O nome do usuário será passado via contexto e o agente pode usar no prompt.

**Opção 2: Mensagem com nome personalizado (requer override habilitado)**
- Se quiser que a app envie uma saudação personalizada com o nome do lead, configure:
  1. **First message** no dashboard: `Olá [Nome], qual desafio posso te ajudar a resolver hoje?`
  2. Habilite **First message** em **Security → Overrides** (ver seção 9)
  3. O código envia `conversation_config_override` com `first_message` e `language: "pt-BR"` na inicialização da conversa

**Nota:** O código usa `conversation_config_override` (recomendado pela ElevenLabs). Os overrides requerem habilitação em Security → Overrides. O nome do lead também é enviado via `contextual_update` para contexto adicional.

---

## 6. System prompt (instruções do agente)

Cole o bloco abaixo em **System prompt** (ou **Instructions**). Ajuste o nome da empresa e detalhes se precisar.

```text
Você é a Lumi, assistente de negócios em português do Brasil. Sua função é entender o desafio do cliente e, com base nos projetos e ferramentas da empresa (Knowledge Base), propor uma solução em formato MVP ou PoC.

## Regras de conduta
- Fale apenas em português brasileiro.
- Use as informações do usuário fornecidas no contexto (nome, empresa, etc.) para personalizar a conversa.
- Baseie suas respostas SOMENTE na Knowledge Base (projetos, ferramentas, capacidades da empresa). Não invente ofertas ou casos de uso que não estejam documentados.
- Não use internet nem buscas externas. Não cite fontes, notícias ou informações que não venham da Knowledge Base.
- Não responda sobre outras empresas de tecnologia, concorrentes ou produtos de terceiros. Mantenha o foco na nossa empresa e no desafio do cliente.
- Se o usuário sair do tema (desafio de negócio, projetos, MVP/PoC), redireja educadamente: "Meu foco é te ajudar com seu desafio de negócio e em como podemos endereçá-lo com um MVP ou PoC. Sobre isso, o que você gostaria de explorar?"
- Se não houver informação na Knowledge Base para a pergunta, diga que não tem essa informação e sugira que o usuário detalhe o desafio para que você possa buscar nos projetos e ferramentas disponíveis.

## Fluxo da conversa
1. Cumprimente usando o nome do usuário (já fornecido na primeira mensagem).
2. Entenda o desafio ou dor que o cliente quer resolver.
3. Consulte a Knowledge Base (projetos, ferramentas, capacidades) para encontrar o que se aplica.
4. Proponha uma solução em formato MVP ou PoC que se encaixe no desafio e no que a empresa oferece.
5. Seja objetiva e amigável. Evite respostas longas demais.
```

---

## 7. Knowledge Base (RAG)

- Em **Knowledge Base**:
  1. Ative **Use RAG** (Retrieval-Augmented Generation).
  2. Adicione documentos com:
     - Descrição dos **projetos** da empresa  
     - **Ferramentas** e capacidades técnicas  
     - Casos de uso ou ofertas que podem virar MVP/PoC  
  3. (Opcional) Em **Advanced**: escolha o **Embedding model** (ex.: `multilingual_e5_large_instruct` para pt-BR) e ajuste **Maximum document chunks** / **Maximum vector distance** se precisar.
  4. Para cada documento, use **Usage mode**: **Auto** (recomendado) para que só trechos relevantes sejam injetados na resposta.

Assim o agente “olha os projetos e ferramentas” e sugere MVP/PoC alinhados ao desafio.

---

## 8. Restrição de internet e escopo

- **Internet:** Por padrão, os agentes ElevenLabs não fazem buscas na web. O prompt acima reforça: “Não use internet nem buscas externas”.
- **Escopo:** As frases no prompt (“Não responda sobre outras empresas…”, “Se o usuário sair do tema…”) garantem que a Lumi só fale do desafio do cliente e do que está na Knowledge Base.

Não é necessário configurar um “bloqueio de internet” na UI; o comportamento é controlado pelo system prompt.

---

## 9. Overrides (segurança) – obrigatório para o [Nome]

A aplicação envia `conversation_config_override` via WebSocket com:
- `first_message` – saudação personalizada com o nome do lead
- `language` – pt-BR

Para que os overrides funcionem:

1. Em **Settings** do agente, abra a aba **Security**.
2. Em **Overrides**, habilite:
   - **First message** (obrigatório para “Olá [Nome], …”).
   - **Language** (se disponível), para garantir pt-BR por sessão.
   - (Opcional) **System prompt**, se no futuro quiser enviar contexto dinâmico por override.

Sem **First message** override ativado, a saudação personalizada não será aplicada.

---

## 10. Obter o Agent ID

- Após salvar o agente, copie o **Agent ID** (ex.: `agent_xxxxx`).
- No projeto, configure no `.env` do backend:

```env
AGENT_ID=agent_xxxxx
```

(O backend aceita `AGENT_ID` ou `ELEVENLABS_AGENT_ID`.)

---

## 11. Resumo de checklist

| Item | Onde configurar |
|------|------------------|
| Voz pt-BR feminina | Voice |
| Modelo v3 (ex.: GPT-4o / Gemini 2.0 Flash) | Model / LLM |
| Idioma pt-BR | Language |
| Saudação com [Nome] | First message + override na app |
| Comportamento e restrições | System prompt |
| Projetos e ferramentas | Knowledge Base + RAG |
| Sem internet / só contexto da empresa | System prompt |
| Override da primeira mensagem | Security → First message |

Depois de publicar o agente e configurar o `AGENT_ID`, a Lumi passará a saudar com o nome do lead e a trabalhar apenas com o desafio e a Knowledge Base, sugerindo MVP/PoC alinhados aos projetos e ferramentas da empresa.
