"use client";

import { useCallback, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { Conversation } from "./components/Conversation";
import { ThankYouPage } from "./components/ThankYouPage";
import type { LeadData } from "./types/lead";
import { API_URL } from "./config";
import { useBrowserConsoleCapture } from "./hooks/useBrowserConsoleCapture";

export default function Home() {
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasEndedConversation, setHasEndedConversation] = useState(false);

  useBrowserConsoleCapture(() => leadData?.email, API_URL);

  const handleLeadSubmit = useCallback(async (data: LeadData) => {
    setIsRegistering(true);
    try {
      const response = await fetch(`${API_URL}/api/leads/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao registrar lead");

      const result = await response.json();
      setLeadData({ ...data, id: result.lead_id });
      setHasEndedConversation(false);
    } catch (error) {
      console.error("Erro ao registrar lead:", error);
      alert("Erro ao processar seu cadastro. Tente novamente.");
    } finally {
      setIsRegistering(false);
    }
  }, []);

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
