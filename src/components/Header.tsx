"use client";

import { useState } from "react";
import { Pill, Download } from "lucide-react";
import { BackupModal } from "./BackupModal";
import { Profile } from "@/features/profiles/types";

interface HeaderProps {
  profiles: Profile[];
  selectedProfileId: number | null;
  onSelectProfile: (id: number) => void;
}

export function Header({
  profiles,
  selectedProfileId,
  onSelectProfile,
}: HeaderProps) {
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-nura-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Logo e Nome do App */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-nura-teal-100 text-nura-teal-700 flex items-center justify-center shadow-xs">
              <Pill className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-nura-slate-900 tracking-tight">
              Nura
            </span>
          </div>

          {/* Perfis e Ações */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Seletor de Perfil */}
            <select
              value={selectedProfileId ?? ""}
              onChange={(e) => onSelectProfile(Number(e.target.value))}
              className="h-10 px-3 rounded-xl border border-nura-slate-200 bg-nura-slate-50 text-xs sm:text-sm font-semibold text-nura-slate-800 focus:outline-none focus:ring-2 focus:ring-nura-teal-500 cursor-pointer transition-all"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} {profile.isDefault ? "(Eu)" : ""}
                </option>
              ))}
            </select>

            {/* Botão de Backup */}
            <button
              onClick={() => setIsBackupOpen(true)}
              className="h-10 w-10 rounded-xl border border-nura-slate-200 bg-nura-slate-50 hover:bg-nura-slate-100 text-nura-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Backup e Dados"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Backup */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onRestored={() => {
          setIsBackupOpen(false);
        }}
      />
    </>
  );
}