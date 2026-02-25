"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { setVerboseMode } from "@/app/utils/logger";

interface VerboseContextType {
  verbose: boolean;
  setVerbose: (value: boolean) => void;
  toggleVerbose: () => void;
}

const VerboseContext = createContext<VerboseContextType | undefined>(undefined);

export function VerboseProvider({ children }: { children: ReactNode }) {
  const [verbose, setVerbose] = useState(false);

  useEffect(() => {
    setVerboseMode(verbose);
  }, [verbose]);

  const toggleVerbose = useCallback(() => {
    setVerbose((prev) => {
      const next = !prev;
      setVerboseMode(next);
      return next;
    });
  }, []);

  return (
    <VerboseContext.Provider value={{ verbose, setVerbose, toggleVerbose }}>
      {children}
    </VerboseContext.Provider>
  );
}

export function useVerbose() {
  const context = useContext(VerboseContext);
  if (context === undefined) {
    throw new Error("useVerbose must be used within a VerboseProvider");
  }
  return context;
}
