"use client";

import { useState, useRef } from "react";
import { Profile } from "../types";
import { backupService } from "@/lib/backupService";
import { Button } from "@/components/ui/button";
import { Pill, ShieldCheck, Upload, RefreshCw, AlertTriangle } from "lucide-react";
import { OnboardingPwaCard } from "@/components/OnboardingPwaCard";

interface OnboardingScreenProps {
  onComplete: (data: Omit<Profile, "id" | "createdAt">) => Promise<void>;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await onComplete({
        name: name.trim(),
        isDefault: true,
        role: "admin",
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsRestoring(true);
        setErrorMessage(null);
        const content = event.target?.result as string;
        await backupService.restoreBackup(content);
        // Recarrega a página para aplicar os dados restaurados
        window.location.reload();
      } catch (error) {
        setErrorMessage("Ficheiro de backup inválido ou corrompido.");
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-nura-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-xl border border-nura-slate-200">

        {/* Cabeçalho */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-nura-teal-100 text-nura-teal-700 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
            <Pill className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-bold text-2xl text-nura-slate-900">
              Bem-vindo ao Nura
            </h1>
            <p className="text-sm text-nura-slate-600">
              O seu gestor médico privado e offline-first. Para começar, diga-nos como devemos chamá-lo ou restaure um backup anterior.
            </p>
          </div>
        </div>

        <OnboardingPwaCard />
        
        {/* Erro de Restauração se houver */}
        {errorMessage && (
          <div className="p-3 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário de Criação de Perfil Inicial */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-nura-slate-700 uppercase tracking-wider">
              Seu Nome ou Apelido
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria Silva"
              required
              className="w-full h-11 px-4 rounded-xl border border-nura-slate-200 bg-nura-slate-50/50 text-sm font-semibold text-nura-slate-900 focus:outline-none focus:ring-2 focus:ring-nura-teal-500 transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isRestoring || !name.trim()}
            className="w-full h-11 bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isSubmitting ? "A configurar..." : "Começar a Usar"}
          </Button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="grow border-t border-nura-slate-200"></div>
          <span className="shrink mx-4 text-xs text-nura-slate-400 uppercase font-semibold">ou</span>
          <div className="grow border-t border-nura-slate-200"></div>
        </div>

        {/* Opção de Restaurar Backup no Onboarding */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting || isRestoring}
            variant="outline"
            className="w-full h-11 border-nura-slate-300 hover:bg-nura-slate-50 text-nura-slate-700 font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isRestoring ? (
              <RefreshCw className="w-4 h-4 animate-spin text-nura-slate-600" />
            ) : (
              <Upload className="w-4 h-4 text-nura-slate-600" />
            )}
            <span>Restaurar de um Backup JSON</span>
          </Button>
        </div>

        {/* Rodapé de Privacidade */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-nura-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-nura-teal-600" />
          <span>Dados armazenados com segurança 100% no seu dispositivo.</span>
        </div>

      </div>
    </div>
  );
}