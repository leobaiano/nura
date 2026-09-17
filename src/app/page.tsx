"use client";

import { useState } from "react";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Trash2, ShieldCheck, User } from "lucide-react";

export default function Home() {
  const { profiles, isLoading, addProfile, removeProfile } = useProfiles();
  const [newName, setNewName] = useState("");

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    await addProfile(newName.trim());
    setNewName("");
  };

  return (
    <main className="min-h-screen p-8 bg-nura-slate-50 space-y-6">
      <h1 className="font-display text-3xl font-bold text-nura-teal-600 flex items-center gap-2">
        <Users className="w-8 h-8 text-nura-teal-600" />
        Nura - Teste da Feature Profiles (Vertical Slice)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Card do Formulário de Criação */}
        <Card className="border-nura-teal-600/20 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl text-nura-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-nura-teal-600" />
              Novo Membro da Família
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <Input
                placeholder="Nome do perfil (ex: Maria, Filho)..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="font-sans"
              />
              <Button
                type="submit"
                className="w-full bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-sans flex gap-2 items-center justify-center"
              >
                <UserPlus className="w-4 h-4" /> Adicionar Perfil
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Card de Listagem Reativa */}
        <Card className="border-nura-teal-600/20 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl text-nura-slate-900 flex items-center justify-between">
              Perfis Cadastrados
              <Badge className="bg-nura-teal-100 text-nura-teal-700">
                Total: {profiles.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="font-sans text-sm text-nura-slate-600">
                Carregando perfis...
              </p>
            ) : (
              <ul className="space-y-3">
                {profiles.map((profile) => (
                  <li
                    key={profile.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-nura-slate-600/10 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      {profile.isDefault ? (
                        <ShieldCheck className="w-5 h-5 text-nura-teal-600" />
                      ) : (
                        <User className="w-5 h-5 text-nura-slate-600" />
                      )}
                      <div>
                        <p className="font-sans text-sm font-semibold text-nura-slate-900">
                          {profile.name}
                        </p>
                        {profile.isDefault && (
                          <span className="text-xs text-nura-teal-600 font-medium">
                            Perfil Principal (Padrão)
                          </span>
                        )}
                      </div>
                    </div>

                    {!profile.isDefault && profile.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProfile(profile.id!)}
                        className="text-nura-rose-600 hover:text-nura-rose-600 hover:bg-nura-rose-600/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}