"use client";

import { Medication } from "../types";
import { Stock } from "@/features/stock/types";
import { Pill, Package, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MedicationWithStock extends Medication {
  stock?: Stock;
}

interface MedicationCardProps {
  medication: MedicationWithStock;
  onDelete: (id: number) => Promise<void>;
}

export function MedicationCard({ medication, onDelete }: MedicationCardProps) {
  const stock = medication.stock;
  const isLowStock =
    stock && stock.currentQuantity <= stock.minimumThreshold;

  const handleDelete = async () => {
    if (
      medication.id !== undefined &&
      confirm(`Tem certeza que deseja remover ${medication.name}?`)
    ) {
      await onDelete(medication.id);
    }
  };

  return (
    <div className="bg-white p-4.5 rounded-2xl border border-nura-slate-200 shadow-2xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        {/* Ícone e Dados Básicos */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-nura-teal-100 text-nura-teal-600 shrink-0 mt-0.5">
            <Pill className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-base text-nura-slate-900">
              {medication.name}
            </h3>
            <p className="text-xs text-nura-slate-600">
              {medication.dosage} {medication.unit}
              {medication.instructions && ` • ${medication.instructions}`}
            </p>
          </div>
        </div>

        {/* Botão Remover */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-nura-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-8 w-8 cursor-pointer shrink-0"
          title="Excluir medicamento"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Indicador de Estoque Integrado */}
      {stock && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-medium ${
            isLowStock
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-nura-slate-50 border-nura-slate-200/80 text-nura-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {isLowStock ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <Package className="w-4 h-4 text-nura-teal-600 shrink-0" />
            )}
            <span>
              Estoque: <strong>{stock.currentQuantity}</strong> {stock.unit}
            </span>
          </div>

          {isLowStock && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-md">
              Estoque Baixo
            </span>
          )}
        </div>
      )}
    </div>
  );
}