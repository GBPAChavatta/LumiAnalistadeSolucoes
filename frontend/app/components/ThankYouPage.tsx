"use client";

import { memo } from "react";

const COMPANY_URL = "https://gbpa.com.br/";

const GBPA_CONTACTS = {
  phones: ["+55 11 3288-3315", "+55 11 95602-0804"],
  email: "contato@gbpa.com.br",
  address: "Av. Angélica, 2491 - 13º andar, Conjunto 135. CEP 01227-200 - São Paulo, SP",
} as const;

interface ThankYouPageProps {
  onRestart: () => void;
}

export const ThankYouPage = memo(function ThankYouPage({ onRestart }: ThankYouPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Obrigado pelo contato!</h1>
          <p className="text-lg text-gray-300">
            Sua conversa foi encerrada com sucesso. Acesse nosso site para mais informações.
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900/40 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Entre em contato</h2>
          <div className="space-y-3 text-gray-200">
            <p>
              <span className="text-gray-400">Telefone:</span>{" "}
              {GBPA_CONTACTS.phones.join(" | ")}
            </p>
            <p>
              <span className="text-gray-400">Email:</span>{" "}
              <a
                href={`mailto:${GBPA_CONTACTS.email}`}
                className="text-blue-400 hover:underline"
              >
                {GBPA_CONTACTS.email}
              </a>
            </p>
            <p>
              <span className="text-gray-400">Endereço:</span> {GBPA_CONTACTS.address}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mb-6">
          <p className="text-sm text-gray-400">Escaneie o QR Code para acessar o site</p>
          <a
            href={COMPANY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-white rounded-lg"
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(COMPANY_URL)}`}
              alt="QR Code para gbpa.com.br"
              width={180}
              height={180}
              className="rounded"
            />
          </a>
          <a
            href={COMPANY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-sm"
          >
            gbpa.com.br
          </a>
        </div>

        <button
          onClick={onRestart}
          className="w-full px-6 py-4 bg-blue-500 text-white rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Iniciar novo atendimento
        </button>
      </div>
    </div>
  );
});
