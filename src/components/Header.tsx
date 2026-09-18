"use client";

import { useState } from "react";
import { Pill, Download, Users } from "lucide-react";
import { BackupModal } from "./BackupModal";
import { ProfileManagementSheet } from "@/features/profiles/components/ProfileManagementSheet";
import { Profile } from "@/features/profiles/types";
import { HeaderPwaTrigger } from "./HeaderPwaTrigger";

interface HeaderProps {
  profiles: Profile[];
  selectedProfileId: number | null;
  onSelectProfile: (id: number) => void;
  onAddProfile: (name: string, role: Profile["role"]) => Promise<void>;
  onDeleteProfile: (id: number) => Promise<void>;
}

export function Header({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile,
}: HeaderProps) {
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isProfilesSheetOpen, setIsProfilesSheetOpen] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "manage-profiles") {
      setIsProfilesSheetOpen(true);
    } else {
      onSelectProfile(Number(value));
    }
  };

  return (
    <>
      <header className="bg-white border-b border-nura-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Logo e Nome do App */}
          <div className="flex items-center gap-2.5">
            <HeaderPwaTrigger />
            
            <div className="w-9 h-9 rounded-2xl bg-nura-teal-100 text-nura-teal-700 flex items-center justify-center shadow-xs">
              <Pill className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-nura-slate-900 tracking-tight">
              Nura
            </span>
          </div>

          {/* Perfis e Ações */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Seletor de Perfil com Opção de Gerenciar */}
            <select
              value={selectedProfileId ?? ""}
              onChange={handleSelectChange}
              className="h-10 px-3 rounded-xl border border-nura-slate-200 bg-nura-slate-50 text-xs sm:text-sm font-semibold text-nura-slate-800 focus:outline-none focus:ring-2 focus:ring-nura-teal-500 cursor-pointer transition-all"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} {profile.isDefault ? "(Eu)" : ""}
                </option>
              ))}
              <option value="manage-profiles" className="font-bold text-nura-teal-700">
                + Dependentes
              </option>
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

      {/* Sidesheet de Gestão de Membros (US05) */}
      <ProfileManagementSheet
        isOpen={isProfilesSheetOpen}
        onClose={() => setIsProfilesSheetOpen(false)}
        profiles={profiles}
        onAddProfile={onAddProfile}
        onDeleteProfile={onDeleteProfile}
      />
    </>
  );
}