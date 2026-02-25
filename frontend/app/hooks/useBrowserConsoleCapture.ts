"use client";

import { useEffect, useRef } from "react";

type ConsoleLevel = "log" | "info" | "warn" | "error" | "debug";

interface BrowserLogEntry {
  timestamp: string;
  level: ConsoleLevel;
  message: string;
}

function safeSerialize(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) {
    return `${value.name}: ${value.message}\n${value.stack || ""}`.trim();
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function useBrowserConsoleCapture(
  getLeadEmail: () => string | undefined,
  apiUrl: string
) {
  const getLeadEmailRef = useRef(getLeadEmail);
  getLeadEmailRef.current = getLeadEmail;

  useEffect(() => {
    const sessionId =
      window.sessionStorage.getItem("browser_log_session_id") ??
      `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    if (!window.sessionStorage.getItem("browser_log_session_id")) {
      window.sessionStorage.setItem("browser_log_session_id", sessionId);
    }

    const queue: BrowserLogEntry[] = [];
    let flushing = false;
    let stopped = false;
    const original = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    };

    const pushEntry = (level: ConsoleLevel, args: unknown[]) => {
      if (stopped) return;
      queue.push({
        timestamp: new Date().toISOString(),
        level,
        message: args.map((a) => safeSerialize(a)).join(" "),
      });
    };

    const flush = async (force = false) => {
      if (flushing || queue.length === 0) return;
      if (!force && queue.length < 20) return;

      const batch = queue.splice(0, 200);
      flushing = true;
      try {
        await fetch(`${apiUrl}/api/debug/browser-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            lead_email: getLeadEmailRef.current(),
            entries: batch,
          }),
        });
      } catch {
        /* ignore */
      } finally {
        flushing = false;
        if (queue.length >= 200) void flush(true);
      }
    };

    const wrap = (level: ConsoleLevel) => (...args: unknown[]) => {
      original[level](...args);
      pushEntry(level, args);
    };

    console.log = wrap("log");
    console.info = wrap("info");
    console.warn = wrap("warn");
    console.error = wrap("error");
    console.debug = wrap("debug");

    const onRejection = (e: PromiseRejectionEvent) =>
      pushEntry("error", ["[unhandledrejection]", e.reason]);
    const onError = (e: ErrorEvent) =>
      pushEntry("error", ["[window.error]", e.message, e.error]);

    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);

    const intervalId = window.setInterval(() => void flush(false), 2500);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
      console.log = original.log;
      console.info = original.info;
      console.warn = original.warn;
      console.error = original.error;
      console.debug = original.debug;
      void flush(true);
    };
  }, [apiUrl]);
}
