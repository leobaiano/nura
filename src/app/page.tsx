"use client";

import { useState } from "react";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { useMedications } from "@/features/medications/hooks/useMedications";
import { stockService } from "@/features/stock/services/stockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Trash2, ShieldCheck, User, Pill, Plus, Package } from "lucide-react";

export default function Home() {
  // --- SLICE PROFILES (US02) ---
  const { profiles, isLoading: loadingProfiles, addProfile, removeProfile } = useProfiles();
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>(undefined);

  // Perfil selecionado para os medicamentos (ou o default "Eu")
  const activeProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  // --- SLICE MEDICATIONS & STOCK (US03) ---
  const { medications, isLoading: loadingMeds, addMedication, removeMedication } = useMedications(activeProfile?.id);
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("500");
  const [stockQty, setStockQty] = useState("10");

  // Handlers do Perfil
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    await addProfile(newProfileName.trim());
    setNewProfileName("");
  };

  // Handlers do Medicamento + Estoque
  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !activeProfile?.id) return;

    // 1. Cadastra medicamento no slice 'medications'
    const medId = await addMedication({
      profileId: activeProfile.id,
      name: medName.trim(),
      dosage: Number(dosage),
      unit: "mg",
      scheduleType: "as_needed",
      active: true,
    });

    // 2. Inicializa estoque no slice 'stock'
    await stockService.setStock({
      medicationId: medId,
      currentQuantity: Number(stockQty),
      minimumThreshold: 3,
      unit: "mg",
    });

    setMedName("");
  };

  return (
    <main className="min-h-screen p-8 bg-nura-slate-50 space-y-8">
      <h1 className="font-display text-3xl font-bold text-nura-teal-600 flex items-center gap-2">
        <Package className="w-8 h-8 text-nura-teal-600" />
        Nura - Teste Integrado de Slices (Profiles + Medications + Stock)
      </h1>

      {/* SEÇÃO 1: TESTE SLICE PROFILES (US02) */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-nura-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-nura-teal-600" />
          1. Teste do Slice: Profiles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <Card className="border-nura-teal-600/20 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg text-nura-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-nura-teal-600" />
                Novo Membro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProfile} className="space-y-4">
                <Input
                  placeholder="Nome do perfil..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="font-sans"
                />
                <Button
                  type="submit"
                  className="w-full bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-sans flex gap-2 justify-center"
                >
                  <UserPlus className="w-4 h-4" /> Adicionar Perfil
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-nura-teal-600/20 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg text-nura-slate-900 flex items-center justify-between">
                Perfis Cadastrados
                <Badge className="bg-nura-teal-100 text-nura-teal-700">
                  Total: {profiles.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProfiles ? (
                <p className="font-sans text-sm text-nura-slate-600">Carregando...</p>
              ) : (
                <ul className="space-y-2">
                  {profiles.map((profile) => (
                    <li
                      key={profile.id}
                      onClick={() => setSelectedProfileId(profile.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        activeProfile?.id === profile.id
                          ? "border-nura-teal-600 bg-nura-teal-600/5"
                          : "border-nura-slate-600/10 bg-white"
                      }`}
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
                          {activeProfile?.id === profile.id && (
                            <span className="text-xs text-nura-teal-600 font-medium">
                              (Selecionado para Medicamentos)
                            </span>
                          )}
                        </div>
                      </div>

                      {!profile.isDefault && profile.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProfile(profile.id!);
                          }}
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
      </section>

      {/* SEÇÃO 2: TESTE SLICE MEDICATIONS & STOCK (US03) */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-nura-slate-900 flex items-center gap-2">
          <Pill className="w-5 h-5 text-nura-teal-600" />
          2. Teste dos Slices: Medications & Stock ({activeProfile?.name ?? "Nenhum perfil"})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <Card className="border-nura-teal-600/20 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg text-nura-slate-900">
                Cadastrar Remédio para {activeProfile?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateMedication} className="space-y-4 font-sans">
                <div>
                  <label className="text-xs text-nura-slate-600">Nome do Medicamento</label>
                  <Input
                    placeholder="Ex: Paracetamol"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-nura-slate-600">Dose (mg)</label>
                    <Input
                      type="number"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-nura-slate-600">Qtd. Estoque</label>
                    <Input
                      type="number"
                      value={stockQty}
                      onChange={(e) => setStockQty(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={!activeProfile}
                  className="w-full bg-nura-teal-600 hover:bg-nura-teal-700 text-white flex gap-2 justify-center"
                >
                  <Plus className="w-4 h-4" /> Cadastrar com Estoque
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-nura-teal-600/20 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg text-nura-slate-900 flex justify-between">
                Medicamentos de {activeProfile?.name}
                <Badge className="bg-nura-teal-100 text-nura-teal-700">
                  Total: {medications.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMeds ? (
                <p className="font-sans text-sm text-nura-slate-600">Carregando remédios...</p>
              ) : medications.length === 0 ? (
                <p className="font-sans text-sm text-nura-slate-500 italic">
                  Nenhum medicamento cadastrado para este perfil.
                </p>
              ) : (
                <ul className="space-y-3 font-sans">
                  {medications.map((med) => (
                    <li
                      key={med.id}
                      className="p-3 bg-white border border-nura-slate-600/10 rounded-lg shadow-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-nura-slate-900">
                          {med.name} - {med.dosage}{med.unit}
                        </p>
                        <span className="text-xs text-nura-slate-500">
                          Tipo: {med.scheduleType}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMedication(med.id!)}
                        className="text-nura-rose-600 hover:bg-nura-rose-600/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}