"use client";

import { useState, useEffect } from "react";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { useDashboard } from "@/features/history/hooks/useDashboard";
import { OnboardingScreen } from "@/features/profiles/components/OnboardingScreen";
import { Header } from "@/components/Header";
import { DoseSummaryCards } from "@/features/history/components/DoseSummaryCards";
import { LowStockAlert } from "@/features/history/components/LowStockAlert";
import { DoseItemCard } from "@/features/history/components/DoseItemCard";
import { Pill } from "lucide-react";

export default function Home() {
  const { profiles, isLoading, addProfile } = useProfiles();
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);

  // Sincroniza o perfil ativo inicial
  useEffect(() => {
    if (profiles.length > 0 && activeProfileId === null) {
      const defaultProfile = profiles.find((p) => p.isDefault) ?? profiles[0];
      if (defaultProfile.id !== undefined) {
        setActiveProfileId(defaultProfile.id);
      }
    }
  }, [profiles, activeProfileId]);

  const {
    medications,
    todayLogs,
    lowStockMeds,
    stats,
    isLoading: isDashboardLoading,
    recordDose,
  } = useDashboard(activeProfileId);

  if (isLoading || isDashboardLoading) {
    return (
      <div className="min-h-screen bg-nura-slate-50 flex items-center justify-center">
        <p className="font-sans text-sm text-nura-slate-600 animate-pulse">
          Carregando Nura...
        </p>
      </div>
    );
  }

  // Se não houver perfis cadastrados, renderiza a tela de onboarding
  if (profiles.length === 0) {
    return <OnboardingScreen onComplete={addProfile} />;
  }

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <div className="min-h-screen bg-nura-slate-50 flex flex-col font-sans">
      {/* Shell / Header Fixo com Seletor de Perfil e Status Offline */}
      <Header
        profiles={profiles}
        selectedProfileId={activeProfileId}
        onSelectProfile={setActiveProfileId}
      />

      {/* Conteúdo da Dashboard */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Saudação */}
        <div>
          <h1 className="font-display text-2xl font-bold text-nura-slate-900">
            Doses de Hoje
          </h1>
          <p className="text-xs sm:text-sm text-nura-slate-600">
            Acompanhamento diário de <strong>{activeProfile?.name}</strong>.
          </p>
        </div>

        {/* Alerta de Estoque Baixo */}
        <LowStockAlert medications={lowStockMeds} />

        {/* Cartões de Resumo do Dia */}
        <DoseSummaryCards stats={stats} />

        {/* Lista de Doses do Dia */}
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-nura-slate-900">
            Medicamentos Cadastrados
          </h2>

          {medications.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-nura-slate-200 text-center space-y-3 shadow-2xs">
              <Pill className="w-10 h-10 text-nura-slate-400 mx-auto" />
              <p className="text-sm font-medium text-nura-slate-700">
                Nenhum medicamento cadastrado para este perfil.
              </p>
              <p className="text-xs text-nura-slate-500 max-w-xs mx-auto">
                Na próxima etapa vamos criar a tela de cadastro de medicamentos e estoque.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {medications.map((med) => {
                const log = todayLogs.find((l) => l.medicationId === med.id);
                return (
                  <DoseItemCard
                    key={med.id}
                    medication={med}
                    log={log}
                    onRecordDose={(medId, status) => recordDose(medId, status)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}