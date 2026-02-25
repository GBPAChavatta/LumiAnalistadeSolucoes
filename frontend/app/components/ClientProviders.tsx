"use client";

import { VerboseProvider } from "@/app/contexts/VerboseContext";
import { VerboseToggle } from "./VerboseToggle";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <VerboseProvider>
      {children}
      <VerboseToggle />
    </VerboseProvider>
  );
}
