  "use client";

/**
 * Landing page com formulário de cadastro do lead.
 * Coleta: Nome, Email, Telefone, Empresa
 */

import { useState, FormEvent, useCallback } from "react";
import type { LeadData } from "@/app/types/lead";

interface LandingPageProps {
  onLeadSubmit: (leadData: LeadData) => void;
  isSubmitting?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLeadSubmit, isSubmitting: externalIsSubmitting = false }) => {
  const [formData, setFormData] = useState<LeadData>({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isSubmittingState = externalIsSubmitting || isSubmitting;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LeadData, string>> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    }

    if (!formData.empresa.trim()) {
      newErrors.empresa = "Empresa é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        await onLeadSubmit(formData);
      } catch (error) {
        console.error("Erro ao processar formulário:", error);
        alert("Erro ao processar seu cadastro. Tente novamente.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onLeadSubmit]
  );

  const handleChange = useCallback((field: keyof LeadData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 p-4">
      <div className="w-full max-w-2xl bg-gray-700 rounded-2xl shadow-2xl border border-gray-600 p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Converse com a Lumi, nossa Analista de Soluções
          </h1>
          <p className="text-lg text-gray-300">
            Preencha seus dados para começar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-semibold text-gray-300 mb-2"
            >
              Nome Completo *
            </label>
            <input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder-gray-400 ${
                errors.nome ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Seu nome completo"
              disabled={isSubmittingState}
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-400">{errors.nome}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder-gray-400 ${
                errors.email ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="seu.email@exemplo.com"
              disabled={isSubmittingState}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label
              htmlFor="telefone"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Telefone *
            </label>
            <input
              id="telefone"
              type="tel"
              value={formData.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder-gray-400 ${
                errors.telefone ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="(11) 99999-9999"
              disabled={isSubmittingState}
            />
            {errors.telefone && (
              <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>
            )}
          </div>

          {/* Empresa */}
          <div>
            <label
              htmlFor="empresa"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Empresa *
            </label>
            <input
              id="empresa"
              type="text"
              value={formData.empresa}
              onChange={(e) => handleChange("empresa", e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder-gray-400 ${
                errors.empresa ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Nome da sua empresa"
              disabled={isSubmittingState}
            />
            {errors.empresa && (
              <p className="mt-1 text-sm text-red-600">{errors.empresa}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmittingState}
            className="w-full px-6 py-4 bg-blue-500 text-white rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {isSubmittingState ? "Processando..." : "Começar Conversa"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            * Campos obrigatórios
          </p>
        </form>
      </div>
    </div>
  );
};
