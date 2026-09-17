"use client";

import { useState } from "react";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { useMedications } from "@/features/medications/hooks/useMedications";
import { useHistory } from "@/features/history/hooks/useHistory";
import { useStock } from "@/features/stock/hooks/useStock";
import { stockService } from "@/features/stock/services/stockService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Trash2,
  ShieldCheck,
  User,
  Pill,
  Plus,
  CheckCircle,
  History,
  Package,
} from "lucide-react";

export default function Home() {
  // --- 1. SLICE PROFILES (US02) ---
  const { profiles, isLoading: loadingProfiles, addProfile, removeProfile } = useProfiles();
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>(undefined);

  const activeProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  // --- 2. SLICE MEDICATIONS & STOCK (US03) ---
  const { medications, isLoading: loadingMeds, addMedication, removeMedication } = useMedications(activeProfile?.id);
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("500");
  const [stockQty, setStockQty] = useState("10");

  // --- 3. SLICE HISTORY (US04) ---
  const { history, registerDose, removeLog } = useHistory(activeProfile?.id);

  // Handlers de Perfil
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    await addProfile(newProfileName.trim());
    setNewProfileName("");
  };

  // Handlers de Medicamento + Estoque
  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !activeProfile?.id) return;

    const medId = await addMedication({
      profileId: activeProfile.id,
      name: medName.trim(),
      dosage: Number(dosage),
      unit: "mg",
      scheduleType: "as_needed",
      active: true,
    });

    await stockService.setStock({
      medicationId: medId,
      currentQuantity: Number(stockQty),
      minimumThreshold: 3,
      unit: "mg",
    });

    setMedName("");
  };

  // Handler para registrar dose (decrementa estoque)
  const handleTakeDose = async (medicationId: number) => {
    if (!activeProfile?.id) return;

    await registerDose({
      profileId: activeProfile.id,
      medicationId,
      scheduledTime: new Date(),
      takenAt: new Date(),
      status: "taken",
    });
  };

  return (
    <main className="min-h-screen p-8 bg-nura-slate-50 space-y-8 font-sans">
      <h1 className="font-display text-3xl font-bold text-nura-teal-600 flex items-center gap-2">
        <Package className="w-8 h-8 text-nura-teal-600" />
        Nura - Teste Integrado (Profiles + Medications + Stock + History)
      </h1>

      {/* SEÇÃO 1: SLICE PROFILES */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-nura-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-nura-teal-600" />
          1. Profiles (Exclusão em Cascata)
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
                <p className="text-sm text-nura-slate-600">Carregando...</p>
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
                          <p className="text-sm font-semibold text-nura-slate-900">
                            {profile.name}
                          </p>
                          {activeProfile?.id === profile.id && (
                            <span className="text-xs text-nura-teal-600 font-medium">
                              (Ativo)
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
                          className="text-nura-rose-600 hover:bg-nura-rose-600/10"
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

      {/* SEÇÃO 2: MEDICAMENTOS, ESTOQUE E HISTÓRICO */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-nura-slate-900 flex items-center gap-2">
          <Pill className="w-5 h-5 text-nura-teal-600" />
          2. Slices: Medications, Stock & History ({activeProfile?.name ?? "Nenhum"})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Cadastro de Medicamento */}
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

          {/* Listagem de Medicamentos */}
          <Card className="border-nura-teal-600/20 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg text-nura-slate-900 flex justify-between">
                Medicamentos ({medications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMeds ? (
                <p className="text-sm text-nura-slate-600">Carregando remédios...</p>
              ) : medications.length === 0 ? (
                <p className="text-sm text-nura-slate-500 italic">
                  Nenhum medicamento cadastrado para este perfil.
                </p>
              ) : (
                <ul className="space-y-3 font-sans">
                  {medications.map((med) => (
                    <MedicationCardItem
                      key={med.id}
                      med={med}
                      onTakeDose={() => handleTakeDose(med.id!)}
                      onRemove={() => removeMedication(med.id!)}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Doses com Desfazer (Estorno) */}
        <Card className="border-nura-teal-600/20 shadow-sm max-w-4xl">
          <CardHeader>
            <CardTitle className="font-display text-lg text-nura-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-nura-teal-600" />
              3. Histórico de Doses Registradas ({history.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-nura-slate-500 italic">
                Nenhuma dose registrada para {activeProfile?.name}.
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((log) => (
                  <li
                    key={log.id}
                    className="p-3 bg-white border border-nura-slate-600/10 rounded-lg text-sm flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className="bg-nura-teal-600 text-white flex gap-1 items-center">
                        <CheckCircle className="w-3.5 h-3.5" /> {log.status}
                      </Badge>
                      <span>
                        Dose tomada às{" "}
                        <strong>{new Date(log.scheduledTime).toLocaleTimeString()}</strong>
                      </span>
                    </div>

                    {log.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLog(log.id!)}
                        title="Desfazer/Apagar log (Estorna +1 ao estoque)"
                        className="text-nura-rose-600 hover:bg-nura-rose-600/10"
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
      </section>
    </main>
  );
}

// Componente para renderizar o medicamento e consultar reativamente seu estoque
function MedicationCardItem({
  med,
  onTakeDose,
  onRemove,
}: {
  med: any;
  onTakeDose: () => void;
  onRemove: () => void;
}) {
  const { stock } = useStock(med.id);

  return (
    <li className="p-3 bg-white border border-nura-slate-600/10 rounded-lg shadow-xs flex justify-between items-center">
      <div>
        <p className="font-semibold text-nura-slate-900">
          {med.name} - {med.dosage}
          {med.unit}
        </p>
        <p className="text-xs text-nura-slate-600">
          Estoque:{" "}
          <span className="font-bold text-nura-teal-600">
            {stock?.currentQuantity ?? "..."}
          </span>{" "}
          (Mín: {stock?.minimumThreshold ?? "..."})
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onTakeDose}
          size="sm"
          className="bg-nura-teal-600 hover:bg-nura-teal-700 text-white flex gap-1 text-xs"
        >
          <CheckCircle className="w-3.5 h-3.5" /> Tomar Dose
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-nura-rose-600 hover:bg-nura-rose-600/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </li>
  );
}