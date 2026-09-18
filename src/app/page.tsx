"use client";

import { useState, useEffect } from "react";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { useDashboard } from "@/features/history/hooks/useDashboard";
import { useMedications } from "@/features/medications/hooks/useMedications";
import { OnboardingScreen } from "@/features/profiles/components/OnboardingScreen";
import { Header } from "@/components/Header";
import { DoseSummaryCards } from "@/features/history/components/DoseSummaryCards";
import { LowStockAlert } from "@/features/history/components/LowStockAlert";
import { DoseItemCard } from "@/features/history/components/DoseItemCard";
import { MedicationList } from "@/features/medications/components/MedicationList";
import { AddMedicationSheet } from "@/features/medications/components/AddMedicationSheet";
import { LayoutDashboard, Pill } from "lucide-react";

export default function Home() {
  const { profiles, isLoading, addProfile } = useProfiles();
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "medications">("dashboard");

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

  const {
    medications: allMedications,
    isLoading: isMedsLoading,
    addMedication,
    removeMedication,
  } = useMedications(activeProfileId ?? undefined);

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
      {/* Shell / Header Fixo */}
      <Header
        profiles={profiles}
        selectedProfileId={activeProfileId}
        onSelectProfile={setActiveProfileId}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Barra de Navegação por Abas */}
        <div className="flex bg-nura-slate-200/60 p-1 rounded-2xl max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-white text-nura-teal-700 shadow-xs"
                : "text-nura-slate-600 hover:text-nura-slate-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Doses do Dia</span>
          </button>
          <button
            onClick={() => setActiveTab("medications")}
            className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "medications"
                ? "bg-white text-nura-teal-700 shadow-xs"
                : "text-nura-slate-600 hover:text-nura-slate-900"
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Medicamentos</span>
          </button>
        </div>

        {/* ABA 1: DASHBOARD DE DOSES */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-nura-slate-900">
                Doses de Hoje
              </h1>
              <p className="text-xs sm:text-sm text-nura-slate-600">
                Acompanhamento diário para <strong>{activeProfile?.name}</strong>.
              </p>
            </div>

            {/* Alerta de Estoque Baixo */}
            <LowStockAlert medications={lowStockMeds} />

            {/* Cartões de Resumo do Dia */}
            <DoseSummaryCards stats={stats} />

            {/* Lista de Doses do Dia */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-nura-slate-900">
                  Medicamentos Cadastrados
                </h2>
                {medications.length > 0 && (
                  <AddMedicationSheet onAddMedication={addMedication} />
                )}
              </div>

              {medications.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-nura-slate-200 text-center space-y-4 shadow-2xs">
                  <Pill className="w-10 h-10 text-nura-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-nura-slate-800">
                      Nenhum medicamento cadastrado ainda
                    </p>
                    <p className="text-xs text-nura-slate-500 max-w-xs mx-auto leading-relaxed">
                      Adicione seu primeiro remédio e defina o estoque inicial para começar a acompanhar as doses.
                    </p>
                  </div>
                  <div className="pt-2">
                    <AddMedicationSheet onAddMedication={addMedication} />
                  </div>
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
          </div>
        )}

        {/* ABA 2: LISTA DE MEDICAMENTOS E ESTOQUE */}
        {activeTab === "medications" && (
          <MedicationList
            medications={allMedications}
            isLoading={isMedsLoading}
            onAddMedication={addMedication}
            onDeleteMedication={removeMedication}
          />
        )}
      </main>
    </div>
  );
}