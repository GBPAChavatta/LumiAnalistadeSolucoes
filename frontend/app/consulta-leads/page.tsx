"use client";

import { useEffect, useState, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { API_URL } from "@/app/config";

interface Lead {
  id: string;
  timestamp: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  contato_feito: boolean;
}

export default function ConsultaLeadsPage() {
  const { data: session, status } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/leads/list`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Erro ao carregar leads");
      }
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchLeads();
    }
  }, [status, session, fetchLeads]);

  const exportToCsv = useCallback(() => {
    const headers = ["Data", "Nome", "Email", "Telefone", "Empresa", "Contato feito"];
    const escape = (v: string) => {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const rows = leads.map((l) =>
      [
        l.timestamp ? new Date(l.timestamp).toLocaleString("pt-BR") : "",
        l.nome,
        l.email,
        l.telefone,
        l.empresa,
        l.contato_feito ? "Sim" : "Não",
      ].map(escape).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [leads]);

  const handleToggleContatoFeito = async (leadId: string, current: boolean) => {
    const next = !current;
    try {
      const res = await fetch(`${API_URL}/api/leads/${leadId}/contato-feito`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contato_feito: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Erro ao atualizar");
      }
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, contato_feito: next } : l))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 p-4">
        <div className="w-full max-w-md bg-gray-700 rounded-2xl shadow-2xl border border-gray-600 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Consulta de Leads
          </h1>
          <p className="text-gray-300 mb-6">
            Acesso restrito a colaboradores @gbpa.com.br
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Entrar com Google
          </button>
          {status === "unauthenticated" && (
            <p className="text-sm text-gray-400 mt-4">
              Use sua conta corporativa @gbpa.com.br
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 p-4 pt-20">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Consulta de Leads</h1>
          <div className="flex items-center gap-3">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt=""
                className="w-9 h-9 rounded-full border-2 border-gray-500"
              />
            )}
            <span className="text-sm text-gray-200 font-medium">
              {session?.user?.name || session?.user?.email || "Usuário"}
            </span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Sair
            </button>
            <a
              href="/"
              className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Ir para Lumi
            </a>
            <button
              onClick={exportToCsv}
              disabled={leads.length === 0}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="bg-gray-700 rounded-2xl shadow-2xl border border-gray-600 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-300">
              Carregando leads...
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchLeads}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
              >
                Tentar novamente
              </button>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-gray-300">
              Nenhum lead cadastrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600 bg-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">
                      Telefone
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">
                      Empresa
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-200 w-32">
                      Contato feito
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-600 hover:bg-gray-600/30"
                    >
                      <td className="px-4 py-3 text-sm text-gray-200">
                        {lead.timestamp
                          ? new Date(lead.timestamp).toLocaleString("pt-BR")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200">
                        {lead.nome}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200">
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-blue-400 hover:underline"
                        >
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200">
                        <a
                          href={`tel:${lead.telefone}`}
                          className="text-blue-400 hover:underline"
                        >
                          {lead.telefone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200">
                        {lead.empresa}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            handleToggleContatoFeito(
                              lead.id,
                              lead.contato_feito
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            lead.contato_feito
                              ? "bg-green-600/80 text-white hover:bg-green-500"
                              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                          }`}
                        >
                          {lead.contato_feito ? "Sim" : "Não"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
