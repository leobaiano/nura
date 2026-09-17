"use client";

import { useState, useEffect } from "react";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { OnboardingScreen } from "@/features/profiles/components/OnboardingScreen";
import { Header } from "@/components/Header";

export default function Home() {
  const { profiles, isLoading, addProfile } = useProfiles();
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);

  // Sincroniza o perfil ativo inicial garantindo que o id exista
  useEffect(() => {
    if (profiles.length > 0 && activeProfileId === null) {
      const defaultProfile = profiles.find((p) => p.isDefault) ?? profiles[0];
      if (defaultProfile.id !== undefined) {
        setActiveProfileId(defaultProfile.id);
      }
    }
  }, [profiles, activeProfileId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nura-slate-50 flex items-center justify-center">
        <p className="font-sans text-sm text-nura-slate-600 animate-pulse">
          Carregando Nura...
        </p>
      </div>
    );
  }

  // Se não houver perfis cadastrados, renderiza a tela de boas-vindas
  if (profiles.length === 0) {
    return <OnboardingScreen onComplete={addProfile} />;
  }

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <div className="min-h-screen bg-nura-slate-50 flex flex-col font-sans">
      {/* Shell / Header Fixo com Seletor e Status */}
      <Header
        profiles={profiles}
        selectedProfileId={activeProfileId}
        onSelectProfile={setActiveProfileId}
      />

      {/* Área do Conteúdo da Dashboard */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-nura-slate-200 shadow-2xs space-y-1">
          <h2 className="font-display text-lg font-bold text-nura-slate-900">
            Painel de {activeProfile?.name}
          </h2>
          <p className="text-xs sm:text-sm text-nura-slate-600">
            O Header e o Shell da aplicação estão ativos e prontos!
          </p>
        </div>
      </main>
    </div>
  );
}