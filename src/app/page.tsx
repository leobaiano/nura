"use client";

import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { OnboardingScreen } from "@/features/profiles/components/OnboardingScreen";

export default function Home() {
  const { profiles, isLoading, addProfile } = useProfiles();

  // Enquanto verifica o IndexedDB, podemos exibir um estado suave de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-nura-slate-50 flex items-center justify-center">
        <p className="font-sans text-sm text-nura-slate-600 animate-pulse">
          Carregando Nura...
        </p>
      </div>
    );
  }

  // Se não existir nenhum perfil cadastrado, exibe a Landing Page / Onboarding
  if (profiles.length === 0) {
    return <OnboardingScreen onComplete={addProfile} />;
  }

  // Quando existir ao menos um perfil, o usuário entra no app principal
  return (
    <main className="min-h-screen p-8 bg-nura-slate-50 font-sans space-y-6">
      <h1 className="font-display text-2xl font-bold text-nura-teal-600">
        Nura - Dashboard Principal
      </h1>
      <p className="text-nura-slate-700">
        Bem-vindo de volta, <strong>{profiles[0].name}</strong>!
      </p>
      {/* Aqui montaremos as visões completas da Dashboard e Navegação */}
    </main>
  );
}