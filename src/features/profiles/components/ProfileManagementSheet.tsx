"use client";

import { useState } from "react";
import { Profile } from "../types";
import { Button } from "@/components/ui/button";
import { Users, Plus, Trash2, X, Shield } from "lucide-react";

interface ProfileManagementSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  onAddProfile: (name: string, role: Profile["role"]) => Promise<void>;
  onDeleteProfile: (id: number) => Promise<void>;
}

export function ProfileManagementSheet({
  isOpen,
  onClose,
  profiles,
  onAddProfile,
  onDeleteProfile,
}: ProfileManagementSheetProps) {
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      // Sempre define novos cadastros como 'member' por padrão (apenas 1 admin)
      await onAddProfile(newName.trim(), "member");
      setNewName("");
    } catch (err) {
      setError("Erro ao criar perfil. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id?: number, isDefault?: boolean) => {
    if (!id) return;
    if (isDefault) {
      alert("Não é possível remover o perfil principal (Administrador).");
      return;
    }
    if (confirm("Tem certeza que deseja remover este dependente? Todos os medicamentos e históricos vinculados serão removidos em cascata.")) {
      try {
        await onDeleteProfile(id);
      } catch (err) {
        setError("Erro ao excluir perfil.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-nura-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Largura ajustada para o mesmo padrão padrão do app (max-w-lg) */}
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Cabeçalho do Sidesheet */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-nura-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-nura-teal-50 text-nura-teal-600 rounded-2xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-nura-slate-900">
                  Gestão de Membros
                </h2>
                <p className="text-xs text-nura-slate-500">
                  Adicione e gerencie os perfis de saúde da família.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-nura-slate-400 hover:text-nura-slate-700 rounded-xl hover:bg-nura-slate-50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Formulário para Adicionar Novo Membro (Sem seletor de função) */}
          <form onSubmit={handleCreate} className="bg-nura-slate-50 p-4 rounded-2xl border border-nura-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold text-nura-slate-700 uppercase tracking-wider">
              Adicionar Novo Membro
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-nura-slate-600">Nome / Apelido</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Filho João, Vó Maria"
                required
                className="w-full h-10 px-3 rounded-xl border border-nura-slate-200 bg-white text-xs sm:text-sm font-semibold text-nura-slate-900 focus:outline-none focus:ring-2 focus:ring-nura-teal-500 transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !newName.trim()}
              className="w-full h-10 bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Membro</span>
            </Button>
          </form>

          {/* Lista de Membros Cadastrados */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-nura-slate-700 uppercase tracking-wider">
              Membros Cadastrados ({profiles.length})
            </h3>
            <div className="space-y-2">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3.5 bg-white border border-nura-slate-200 rounded-2xl shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-nura-teal-100 text-nura-teal-700 flex items-center justify-center font-bold text-xs">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs sm:text-sm text-nura-slate-900">
                          {profile.name}
                        </span>
                        {profile.isDefault && (
                          <span className="px-1.5 py-0.5 bg-nura-teal-50 text-nura-teal-700 rounded-md text-[10px] font-bold">
                            Principal
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-nura-slate-500 capitalize flex items-center gap-1">
                        <Shield className="w-3 h-3 text-nura-slate-400" />
                        {profile.role === "admin" ? "Administrador" : "Membro / Dependente"}
                      </span>
                    </div>
                  </div>

                  {!profile.isDefault && (
                    <button
                      onClick={() => handleDelete(profile.id, profile.isDefault)}
                      className="p-2 text-nura-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
                      title="Excluir membro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="pt-4 border-t border-nura-slate-200 flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-11 border-nura-slate-300 text-nura-slate-700 font-semibold rounded-xl cursor-pointer"
          >
            Concluir / Fechar
          </Button>
        </div>

      </div>
    </div>
  );
}