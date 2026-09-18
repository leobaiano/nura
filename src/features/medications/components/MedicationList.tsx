"use client";

import { MedicationCard } from "./MedicationCard";
import { AddMedicationSheet } from "./AddMedicationSheet";
import { CreateMedicationWithStockInput } from "../hooks/useMedications";
import { Medication } from "../types";
import { Stock } from "@/features/stock/types";
import { Pill } from "lucide-react";

interface MedicationWithStock extends Medication {
  stock?: Stock;
}

interface MedicationListProps {
  medications: MedicationWithStock[];
  isLoading: boolean;
  onAddMedication: (data: CreateMedicationWithStockInput) => Promise<unknown>;
  onDeleteMedication: (id: number) => Promise<void>;
}

export function MedicationList({
  medications,
  isLoading,
  onAddMedication,
  onDeleteMedication,
}: MedicationListProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-xs text-nura-slate-500 animate-pulse">
        Carregando medicamentos...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Lista com Botão para Abrir o Side Sheet */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-nura-slate-900">
            Meus Medicamentos
          </h2>
          <p className="text-xs text-nura-slate-600">
            {medications.length} {medications.length === 1 ? "remedial cadastrado" : "remédios cadastrados"}
          </p>
        </div>

        <AddMedicationSheet onAddMedication={onAddMedication} />
      </div>

      {/* Lista ou Estado Vazio */}
      {medications.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-nura-slate-200 text-center space-y-3 shadow-2xs">
          <Pill className="w-10 h-10 text-nura-slate-400 mx-auto" />
          <p className="text-sm font-medium text-nura-slate-700">
            Nenhum medicamento cadastrado ainda.
          </p>
          <p className="text-xs text-nura-slate-500 max-w-xs mx-auto leading-relaxed">
            Clique no botão acima para adicionar remédios e controlar o estoque facilmente.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {medications.map((med) => (
            <MedicationCard
              key={med.id}
              medication={med}
              onDelete={onDeleteMedication}
            />
          ))}
        </div>
      )}
    </div>
  );
}