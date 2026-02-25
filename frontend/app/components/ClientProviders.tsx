"use client";

import { VerboseProvider } from "@/app/contexts/VerboseContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <VerboseProvider>{children}</VerboseProvider>;
}
