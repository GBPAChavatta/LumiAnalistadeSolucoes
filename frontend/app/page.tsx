"use client";

import { useCallback, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { Conversation } from "./components/Conversation";
import { ThankYouPage } from "./components/ThankYouPage";
import type { LeadData } from "./types/lead";
import { API_URL, USE_SUPABASE_LEADS } from "./config";
import { useBrowserConsoleCapture } from "./hooks/useBrowserConsoleCapture";

export default function Home() {
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasEndedConversation, setHasEndedConversation] = useState(false);

  useBrowserConsoleCapture(() => leadData?.email, API_URL);

  const registerViaSupabase = useCallback(async (data: LeadData): Promise<string> => {
    const { createClient } = await import("./lib/supabase/client");
    const supabase = createClient();
    const { data: row, error } = await supabase
      .from("leads")
      .insert({
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        empresa: data.empresa,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    if (!row?.id) throw new Error("Lead não foi salvo. Verifique as políticas RLS no Supabase.");
    return String(row.id);
  }, []);

  const registerViaBackend = useCallback(async (data: LeadData): Promise<string> => {
    const controller = new AbortController();
    const timeoutMs = 15000;
    const id = setTimeout(
      () => controller.abort(new DOMException(`Tempo esgotado (${timeoutMs / 1000}s)`, "AbortError")),
      timeoutMs
    );
    try {
      const healthRes = await fetch(`${API_URL}/api/health`, { signal: controller.signal });
      clearTimeout(id);
      if (!healthRes.ok) {
        const body = await healthRes.json().catch(() => ({}));
        const detail = body?.detail || "API ou banco indisponível.";
        const hint = " Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY no .env.local para usar o Supabase diretamente.";
        throw new Error(detail + hint);
      }
      const ctrl2 = new AbortController();
      const id2 = setTimeout(() => ctrl2.abort(), timeoutMs);
      const res = await fetch(`${API_URL}/api/leads/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: ctrl2.signal,
      });
      clearTimeout(id2);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const d = body?.detail;
        const detail = typeof d === "string" ? d : Array.isArray(d) ? d.map((x: { msg?: string }) => x?.msg || String(x)).join("; ") : "Erro ao registrar lead";
        const hint = !USE_SUPABASE_LEADS ? " Configure Supabase no .env.local para salvar direto no banco." : "";
        throw new Error((detail || "Erro ao registrar lead") + hint);
      }
      const result = await res.json();
      if (!result.lead_id) throw new Error("Lead não foi salvo corretamente.");
      return result.lead_id;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  }, []);

  const handleLeadSubmit = useCallback(
    async (data: LeadData) => {
      setIsRegistering(true);
      try {
        let leadId: string;
        if (USE_SUPABASE_LEADS) {
          try {
            leadId = await registerViaSupabase(data);
          } catch (supabaseError) {
            const msg = supabaseError instanceof Error ? supabaseError.message : String(supabaseError);
            if (msg.includes("row-level security") || msg.includes("RLS") || msg.includes("violates")) {
              leadId = await registerViaBackend(data);
            } else {
              throw supabaseError;
            }
          }
        } else {
          leadId = await registerViaBackend(data);
        }
        setLeadData({ ...data, id: leadId });
        setHasEndedConversation(false);
      } catch (error) {
        const isAbort = error instanceof Error && error.name === "AbortError";
        const message = isAbort
          ? "Tempo esgotado. Verifique se o backend está rodando."
          : error instanceof Error
            ? error.message
            : "Erro ao processar seu cadastro.";
        if (!isAbort) console.error("Erro ao registrar lead:", error);
        alert(message);
      } finally {
        setIsRegistering(false);
      }
    },
    [registerViaSupabase, registerViaBackend]
  );

  const handleRestart = useCallback(() => {
    setLeadData(null);
    setHasEndedConversation(false);
  }, []);

  if (!leadData) {
    return <LandingPage onLeadSubmit={handleLeadSubmit} isSubmitting={isRegistering} />;
  }

  if (hasEndedConversation) {
    return <ThankYouPage onRestart={handleRestart} />;
  }

  return (
    <Conversation
      leadData={leadData}
      onConversationEnded={() => setHasEndedConversation(true)}
    />
  );
}
