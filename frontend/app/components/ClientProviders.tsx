"use client";

import { SessionProvider } from "next-auth/react";
import { VerboseProvider } from "@/app/contexts/VerboseContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <VerboseProvider>{children}</VerboseProvider>
    </SessionProvider>
  );
}
