"use client";

import { useCallback } from "react";
import { useVerbose } from "@/app/contexts/VerboseContext";

export function VerboseToggle() {
  const { verbose, toggleVerbose } = useVerbose();

  const handleToggle = useCallback(() => {
    toggleVerbose();
    console.log(verbose ? "🔇 Modo verbose DESATIVADO" : "🔍 Modo verbose ATIVADO");
  }, [verbose, toggleVerbose]);

  return (
    <button
      onClick={handleToggle}
      className={`
        fixed bottom-4 right-4 z-50
        px-4 py-2 rounded-lg
        text-sm font-medium
        transition-all duration-200
        shadow-lg
        ${
          verbose
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-200"
        }
      `}
      title={verbose ? "Desativar logs detalhados" : "Ativar logs detalhados"}
    >
      {verbose ? "🔍 Verbose ON" : "🔇 Verbose OFF"}
    </button>
  );
}
