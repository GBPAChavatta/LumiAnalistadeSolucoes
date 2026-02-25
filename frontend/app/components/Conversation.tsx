"use client";

/**
 * Componente principal de conversação usando SDK oficial ElevenLabs.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import type { LeadData } from "@/app/types/lead";
import type { MessagePayload } from "@elevenlabs/types";
import { API_URL } from "@/app/config";

interface Transcript {
  id: string;
  text: string;
  timestamp: Date;
  speaker: "user" | "agent";
}

interface ConversationProps {
  leadData: LeadData;
  onConversationEnded?: () => void;
}

export function Conversation({ leadData, onConversationEnded }: ConversationProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [statusText, setStatusText] = useState("desconectado");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const contextSentRef = useRef(false);
  const userAudioEventIdRef = useRef(0);
  const agentAudioEventIdRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const userMediaStreamRef = useRef<MediaStream | null>(null);

  const firstName = useMemo(() => {
    const nomeCompleto = leadData.nome?.trim() || "";
    const first = nomeCompleto.split(/\s+/)[0] || "";
    return first.length > 1 ? first : "visitante";
  }, [leadData.nome]);

  const contextText = useMemo(() => {
    return `Informações do usuário: Nome completo: ${leadData.nome}, Primeiro nome: ${firstName}, Email: ${leadData.email}, Telefone: ${leadData.telefone}, Empresa: ${leadData.empresa}. Use o primeiro nome para personalizar a conversa.`;
  }, [leadData, firstName]);

  const saveTranscript = useCallback(
    async (speaker: "user" | "agent", text: string) => {
      if (!text.trim()) {
        return;
      }
      try {
        await fetch(`${API_URL}/api/transcripts/stt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_email: leadData.email,
            speaker,
            text,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("[Conversation] erro ao salvar transcrição:", err);
      }
    },
    [leadData.email]
  );

  const saveAudio = useCallback(
    async (speaker: "user" | "agent", audioBase64: string, eventId: number, audioFormat?: string) => {
      if (!audioBase64) {
        return;
      }
      try {
        await fetch(`${API_URL}/api/transcripts/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_email: leadData.email,
            lead_id: leadData.id,
            speaker,
            audio_base64: audioBase64,
            event_id: eventId,
            timestamp: new Date().toISOString(),
            audio_format: audioFormat,
          }),
        });
      } catch (err) {
        console.error("[Conversation] erro ao salvar áudio:", err);
      }
    },
    [leadData.email, leadData.id]
  );

  const onMessage = useCallback(
    (payload: MessagePayload) => {
      if (!payload.message?.trim()) {
        return;
      }

      const speaker: "user" | "agent" = payload.role === "agent" ? "agent" : "user";
      setTranscripts((prev) => [
        ...prev,
        {
          id: `${speaker}-${Date.now()}-${Math.random()}`,
          text: payload.message,
          timestamp: new Date(),
          speaker,
        },
      ]);
      void saveTranscript(speaker, payload.message);
    },
    [saveTranscript]
  );

  const onAudio = useCallback(
    (base64Audio: string) => {
      agentAudioEventIdRef.current += 1;
      void saveAudio("agent", base64Audio, agentAudioEventIdRef.current, "pcm");
    },
    [saveAudio]
  );

  const conversation = useConversation({
    onConnect: () => {
      setStatusText("conectado");
      setErrorMessage(null);
    },
    onDisconnect: () => {
      setStatusText("desconectado");
      contextSentRef.current = false;
    },
    onStatusChange: ({ status }) => {
      setStatusText(status);
    },
    onError: (message, context) => {
      console.error("[Conversation] erro SDK:", message, context);
      setErrorMessage(message);
    },
    onMessage,
    onAudio,
  });

  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          reject(new Error("Falha ao converter blob para base64"));
          return;
        }
        const base64 = result.split(",")[1] || "";
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Erro ao ler blob"));
      reader.readAsDataURL(blob);
    });
  }, []);

  const startUserAudioCapture = useCallback(
    async (stream: MediaStream) => {
      try {
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        recorder.ondataavailable = async (event) => {
          if (!event.data || event.data.size === 0) {
            return;
          }
          const base64 = await blobToBase64(event.data);
          userAudioEventIdRef.current += 1;
          await saveAudio("user", base64, userAudioEventIdRef.current, "webm");
        };
        recorder.start(4000);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.error("[Conversation] não foi possível iniciar gravação de auditoria do usuário:", err);
      }
    },
    [blobToBase64, saveAudio]
  );

  const stopUserAudioCapture = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (userMediaStreamRef.current) {
      userMediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    userMediaStreamRef.current = null;
  }, []);

  const getConversationToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_URL}/api/conversation/token`);
      if (!response.ok) {
        throw new Error(`Falha ao obter token: ${response.status}`);
      }
      const data = await response.json();
      return data.conversation_token || null;
    } catch (err) {
      console.warn("[Conversation] token WebRTC indisponível, tentando signed-url:", err);
      return null;
    }
  }, []);

  const getSignedUrl = useCallback(async (): Promise<string> => {
    const response = await fetch(`${API_URL}/api/conversation/signed-url`);
    if (!response.ok) {
      throw new Error(`Falha ao obter signed URL: ${response.status}`);
    }
    const data = await response.json();
    return data.signed_url;
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      setIsStarting(true);
      setErrorMessage(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      userMediaStreamRef.current = stream;
      await startUserAudioCapture(stream);

      const firstMessage = `Olá ${firstName}, qual desafio posso te ajudar a resolver hoje?`;
      const dynamicVars = {
        nome: leadData.nome,
        primeiro_nome: firstName,
        email: leadData.email,
        telefone: leadData.telefone,
        empresa: leadData.empresa,
      };
      const userId = leadData.id || leadData.email;

      const token = await getConversationToken();
      if (token) {
        await conversation.startSession({
          conversationToken: token,
          connectionType: "webrtc",
          userId,
          dynamicVariables: dynamicVars,
          overrides: { agent: { firstMessage } },
        });
      } else {
        const signedUrl = await getSignedUrl();
        await conversation.startSession({
          signedUrl,
          userId,
          dynamicVariables: dynamicVars,
          overrides: { agent: { firstMessage } },
        });
      }
    } catch (err) {
      console.error("[Conversation] falha ao iniciar sessão:", err);
      setErrorMessage("Falha ao iniciar sessão com o agente.");
      stopUserAudioCapture();
    } finally {
      setIsStarting(false);
    }
  }, [
    conversation,
    firstName,
    getConversationToken,
    getSignedUrl,
    leadData,
    startUserAudioCapture,
    stopUserAudioCapture,
  ]);

  const handleDisconnect = useCallback(async () => {
    try {
      await conversation.endSession();
    } finally {
      stopUserAudioCapture();
      onConversationEnded?.();
    }
  }, [conversation, onConversationEnded, stopUserAudioCapture]);

  useEffect(() => {
    if (conversation.status === "connected" && !contextSentRef.current) {
      conversation.sendContextualUpdate(contextText);
      contextSentRef.current = true;
    }
  }, [conversation, contextText]);

  useEffect(() => {
    return () => {
      stopUserAudioCapture();
    };
  }, [stopUserAudioCapture]);

  const canStart = conversation.status === "disconnected" && !isStarting;
  const canStop = conversation.status === "connected" || conversation.status === "connecting";

  const statusConfig = useMemo(() => {
    const map: Record<string, { color: string; label: string }> = {
      connected: { color: "bg-green-500", label: "Conectado" },
      connecting: { color: "bg-yellow-500", label: "Conectando..." },
      disconnecting: { color: "bg-orange-500", label: "Desconectando..." },
    };
    return map[conversation.status] ?? { color: "bg-gray-500", label: "Desconectado" };
  }, [conversation.status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">ElevenLabs AgentAI</h1>
          <p className="text-gray-300">Integração oficial do widget/SDK ElevenLabs</p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusConfig.color} animate-pulse`} />
          <span className="text-sm font-medium text-gray-300">{statusConfig.label}</span>
          <span className="text-xs text-gray-400">({statusText})</span>
          {errorMessage && <span className="text-sm text-red-400 ml-2">Erro: {errorMessage}</span>}
        </div>

        <div className="mb-8 flex justify-center gap-4">
          <button
            onClick={handleConnect}
            disabled={!canStart}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? "Iniciando..." : "Iniciar conversa"}
          </button>
          <button
            onClick={handleDisconnect}
            disabled={!canStop}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors border border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Encerrar conversa
          </button>
        </div>

        <div className="mb-6 max-h-96 overflow-y-auto space-y-4">
          {transcripts.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Inicie a conversa para começar a transcrição em tempo real
            </div>
          ) : (
            transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className={`p-4 rounded-lg ${
                  transcript.speaker === "user"
                    ? "bg-blue-900 ml-8 border-l-4 border-blue-500"
                    : "bg-gray-700 mr-8 border-r-4 border-gray-500"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-300 uppercase">
                    {transcript.speaker === "user" ? "Você" : "Agente"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {transcript.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-100">{transcript.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
