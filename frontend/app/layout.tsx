import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const GBPA_LOGO_URL = "https://gbpa.com.br/wp-content/uploads/2022/08/LOGO-GRUPO-GROWTEC-01-scaled.png";
const GBPA_FAVICON_URL = "https://gbpa.com.br/wp-content/uploads/2022/08/cropped-favicon-32x32.png";

export const metadata: Metadata = {
  title: "Lumi - Converse com a Lumi",
  description: "Conversa inteligente com assistente de voz",
  icons: {
    icon: GBPA_FAVICON_URL,
    shortcut: GBPA_FAVICON_URL,
    apple: GBPA_FAVICON_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-700 text-gray-100`}
      >
        {/* Logo GBPA fixo no canto esquerdo superior */}
        <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
          <a
            href="https://gbpa.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-24 h-auto md:w-32 lg:w-36 opacity-90 hover:opacity-100 transition-opacity"
            aria-label="GBPA - Grupo Growtec"
          >
            <img
              src={GBPA_LOGO_URL}
              alt="GBPA - Grupo Growtec"
              className="w-full h-auto object-contain"
            />
          </a>
          <a
            href="/consulta-leads"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Consulta Leads
          </a>
        </div>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
