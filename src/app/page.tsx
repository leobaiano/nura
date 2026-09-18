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
import { HistoryView } from "@/features/history/components/HistoryView";
import { LayoutDashboard, Pill, Activity } from "lucide-react";
import { DoseLog } from "@/features/history/types";
import { db } from "@/lib/db";
import { NotificationBanner } from "@/features/history/components/NotificationBanner";
import { notificationScheduler } from "@/lib/notificationScheduler";
import { AntiOverdoseModal } from "@/features/history/components/AntiOverdoseModal";

export default function Home() {
  const { profiles, isLoading, addProfile } = useProfiles();
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "medications" | "history">("dashboard");

  // Estados de controlo para a Trava Anti-Overdose (US13)
  const [overdoseModalState, setOverdoseModalState] = useState<{
    isOpen: boolean;
    medicationId: number | null;
    medicationName: string;
    lastTakenTime: Date;
    minutesAgo: number;
    scheduledDateTime?: Date;
  }>({
    isOpen: false,
    medicationId: null,
    medicationName: "",
    lastTakenTime: new Date(),
    minutesAgo: 0,
  });

  useEffect(() => {
    if (profiles.length > 0 && activeProfileId === null) {
      const defaultProfile = profiles.find((p) => p.isDefault) ?? profiles[0];
      if (defaultProfile.id !== undefined) {
        setActiveProfileId(defaultProfile.id);
      }
    }

    notificationScheduler.initScheduler();
  }, [profiles, activeProfileId]);

  // Ouvinte de mensagens vindas do Service Worker (Quick Actions da US12)
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handleServiceWorkerMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === "EXECUTE_CONFIRM_DOSE") {
        const { medicationId, profileId: payloadProfileId } = event.data.payload;

        try {
          await db.transaction("rw", [db.medications, db.stocks, db.doseLogs], async () => {
            const medication = await db.medications.get(medicationId);
            const actualProfileId = payloadProfileId || (medication ? medication.profileId : 1);

            const stock = await db.stocks.where("medicationId").equals(medicationId).first();
            if (stock && stock.id !== undefined) {
              await db.stocks.update(stock.id, {
                currentQuantity: Math.max(0, stock.currentQuantity - 1),
                updatedAt: new Date(),
              });
            }

            await db.doseLogs.add({
              medicationId,
              profileId: actualProfileId,
              scheduledTime: new Date(),
              takenAt: new Date(),
              status: "taken",
              notes: "Confirmado via Quick Action (Notificação)",
              createdAt: new Date(),
            });
          });

          console.log("Dose confirmada com o profileId correto!");
        } catch (error) {
          console.error("Erro ao processar confirmação do Service Worker:", error);
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, []);

  const {
    scheduledDoses,
    todayLogs,
    lowStockMeds,
    stats,
    isLoading: isDashboardLoading,
    recordDose,
    medications,
  } = useDashboard(activeProfileId);

  const {
    medications: allMedications,
    isLoading: isMedsLoading,
    addMedication,
    removeMedication,
  } = useMedications(activeProfileId ?? undefined);

  // Wrapper seguro para lidar com o registo e intercetar o aviso Anti-Overdose
  const handleRecordDoseWithCheck = async (
    medId: number,
    status: "taken" | "skipped" | "late",
    scheduledDateTime?: Date,
    forceOverride: boolean = false
  ) => {
    try {
      await recordDose(medId, status, scheduledDateTime, forceOverride);
    } catch (err: any) {
      if (err && err.code === "ANTI_OVERDOSE_WARNING") {
        const medObj = medications.find((m) => m.id === medId);
        setOverdoseModalState({
          isOpen: true,
          medicationId: medId,
          medicationName: medObj?.name || "Medicamento",
          lastTakenTime: err.lastTakenTime,
          minutesAgo: err.minutesAgo,
          scheduledDateTime,
        });
      } else {
        console.error("Erro ao registrar dose:", err);
      }
    }
  };

  if (isLoading || isDashboardLoading) {
    return (
      <div className="min-h-screen bg-nura-slate-50 flex items-center justify-center">
        <p className="font-sans text-sm text-nura-slate-600 animate-pulse">
          Carregando Nura...
        </p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <OnboardingScreen
        onComplete={async (data) => {
          await addProfile(data.name, data.role);
        }}
      />
    );
  }

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <div className="min-h-screen bg-nura-slate-50 flex flex-col font-sans">
      <Header
        profiles={profiles}
        selectedProfileId={activeProfileId}
        onSelectProfile={setActiveProfileId}
        onAddProfile={async (name, role) => {
          await addProfile(name, role);
        }}
        onDeleteProfile={async (id) => {
          await db.transaction('rw', [db.profiles, db.medications, db.doseLogs, db.stocks], async () => {
            await db.medications.where('profileId').equals(id).delete();
            await db.profiles.delete(id);
          });
          window.location.reload();
        }}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navegação por Abas (Dashboard, Medicamentos e Histórico) */}
        <div className="flex bg-nura-slate-200/60 p-1 rounded-2xl max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "dashboard"
                ? "bg-white text-nura-teal-700 shadow-xs"
                : "text-nura-slate-600 hover:text-nura-slate-900"
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Doses</span>
          </button>
          <button
            onClick={() => setActiveTab("medications")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "medications"
                ? "bg-white text-nura-teal-700 shadow-xs"
                : "text-nura-slate-600 hover:text-nura-slate-900"
              }`}
          >
            <Pill className="w-4 h-4" />
            <span>Remédios</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "history"
                ? "bg-white text-nura-teal-700 shadow-xs"
                : "text-nura-slate-600 hover:text-nura-slate-900"
              }`}
          >
            <Activity className="w-4 h-4" />
            <span>Histórico</span>
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

            <NotificationBanner />
            <LowStockAlert medications={lowStockMeds} />
            <DoseSummaryCards stats={stats} />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-nura-slate-900">
                  Agenda de Doses
                </h2>
                {allMedications.length > 0 && (
                  <AddMedicationSheet onAddMedication={addMedication} />
                )}
              </div>

              {scheduledDoses.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-nura-slate-200 text-center space-y-4 shadow-2xs">
                  <Pill className="w-10 h-10 text-nura-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-nura-slate-800">
                      Nenhum medicamento cadastrado ainda
                    </p>
                    <p className="text-xs text-nura-slate-500 max-w-xs mx-auto leading-relaxed">
                      Adicione seu primeiro remédio e configure os horários de tomada.
                    </p>
                  </div>
                  <div className="pt-2">
                    <AddMedicationSheet onAddMedication={addMedication} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {scheduledDoses.map((item, idx) => {
                    const isAsNeeded =
                      item.medication.scheduleType === "as_needed" ||
                      !item.medication.scheduleType;

                    const log = isAsNeeded
                      ? undefined
                      : todayLogs.find((l: DoseLog) => {
                        if (l.medicationId !== item.medication.id) return false;
                        const logTimeStr = `${String(
                          new Date(l.scheduledTime).getHours()
                        ).padStart(2, "0")}:${String(
                          new Date(l.scheduledTime).getMinutes()
                        ).padStart(2, "0")}`;
                        return logTimeStr === item.scheduledTime;
                      });

                    return (
                      <DoseItemCard
                        key={`${item.medication.id}-${item.scheduledTime || idx}`}
                        medication={item.medication}
                        log={log}
                        scheduledTime={item.scheduledTime}
                        scheduledDateTime={item.scheduledDateTime}
                        onRecordDose={(medId, status) =>
                          handleRecordDoseWithCheck(medId, status, item.scheduledDateTime)
                        }
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

        {/* ABA 3: HISTÓRICO DE TOMADAS E ADESÃO */}
        {activeTab === "history" && activeProfileId && (
          <HistoryView profileId={activeProfileId} />
        )}
      </main>

      {/* Modal C: Alerta de Trava Anti-Overdose (US13) */}
      <AntiOverdoseModal
        isOpen={overdoseModalState.isOpen}
        medicationName={overdoseModalState.medicationName}
        lastTakenTime={overdoseModalState.lastTakenTime}
        minutesAgo={overdoseModalState.minutesAgo}
        onCancel={() =>
          setOverdoseModalState({ ...overdoseModalState, isOpen: false })
        }
        onConfirmOverride={async () => {
          if (overdoseModalState.medicationId !== null) {
            await handleRecordDoseWithCheck(
              overdoseModalState.medicationId,
              "taken",
              overdoseModalState.scheduledDateTime,
              true // Força a gravação ignorando o limite de tempo
            );
          }
          setOverdoseModalState({ ...overdoseModalState, isOpen: false });
        }}
      />
    </div>
  );
}