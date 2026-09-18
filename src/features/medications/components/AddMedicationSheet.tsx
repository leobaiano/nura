"use client";

import { useState } from "react";
import { DosageUnit, ScheduleType } from "../types";
import { CreateMedicationWithStockInput } from "../hooks/useMedications";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pill, Package, Clock, Trash2 } from "lucide-react";

interface AddMedicationSheetProps {
  onAddMedication: (data: CreateMedicationWithStockInput) => Promise<unknown>;
}

const DOSAGE_UNITS: { value: DosageUnit; label: string }[] = [
  { value: "mg", label: "mg (Miligramas)" },
  { value: "ml", label: "ml (Mililitros)" },
  { value: "gotas", label: "Gotas" },
  { value: "comprimido", label: "Comprimido(s)" },
  { value: "capsula", label: "Cápsula(s)" },
  { value: "unidade", label: "Unidade(s)" },
];

export function AddMedicationSheet({ onAddMedication }: AddMedicationSheetProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados básicos
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState<number | "">(1);
  const [unit, setUnit] = useState<DosageUnit>("comprimido");
  const [instructions, setInstructions] = useState("");

  // Estados de Agendamento
  const [scheduleType, setScheduleType] = useState<ScheduleType>("as_needed");
  const [intervalHours, setIntervalHours] = useState<number | "">(8);
  const [firstDoseTime, setFirstDoseTime] = useState<string>("08:00");
  const [specificTimes, setSpecificTimes] = useState<string[]>(["08:00"]);

  // Estados de Estoque
  const [initialQuantity, setInitialQuantity] = useState<number | "">(20);
  const [minimumThreshold, setMinimumThreshold] = useState<number | "">(5);

  const handleAddSpecificTime = () => {
    setSpecificTimes([...specificTimes, "12:00"]);
  };

  const handleRemoveSpecificTime = (index: number) => {
    if (specificTimes.length === 1) return;
    setSpecificTimes(specificTimes.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, value: string) => {
    const updated = [...specificTimes];
    updated[index] = value;
    setSpecificTimes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || dosage === "" || initialQuantity === "" || minimumThreshold === "") return;

    try {
      setIsSubmitting(true);

      // Se for intervalo fixo, salvamos o primeiro horário no array specificTimes para referência
      const resolvedSpecificTimes =
        scheduleType === "fixed_interval"
          ? [firstDoseTime]
          : scheduleType === "specific_times"
          ? specificTimes
          : undefined;

      await onAddMedication({
        name: name.trim(),
        dosage: Number(dosage),
        unit,
        instructions: instructions.trim() || undefined,
        scheduleType,
        intervalHours: scheduleType === "fixed_interval" && intervalHours !== "" ? Number(intervalHours) : undefined,
        specificTimes: resolvedSpecificTimes,
        initialQuantity: Number(initialQuantity),
        minimumThreshold: Number(minimumThreshold),
      });

      // Reset
      setName("");
      setDosage(1);
      setUnit("comprimido");
      setInstructions("");
      setScheduleType("as_needed");
      setIntervalHours(8);
      setFirstDoseTime("08:00");
      setSpecificTimes(["08:00"]);
      setInitialQuantity(20);
      setMinimumThreshold(5);
      setOpen(false);
    } catch (error) {
      console.error("Erro ao cadastrar medicamento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-nura-teal-600 hover:bg-nura-teal-700 text-white rounded-xl shadow-xs flex items-center gap-2 font-semibold text-xs sm:text-sm cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Novo Medicamento</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md bg-white p-6 space-y-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-xl font-bold text-nura-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-nura-teal-600" />
              Cadastrar Medicamento
            </SheetTitle>
            <SheetDescription className="text-xs text-nura-slate-500">
              Configure os dados do remédio, horários e estoque inicial.
            </SheetDescription>
          </SheetHeader>

          <form id="add-medication-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Seção 1: Informações Básicas */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs font-semibold text-nura-slate-700">
                  Nome do Medicamento *
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Paracetamol, Dipirona"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 rounded-xl bg-nura-slate-50 border-nura-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dosage" className="text-xs font-semibold text-nura-slate-700">
                    Dosagem por Dose *
                  </Label>
                  <Input
                    id="dosage"
                    type="number"
                    min="0.1"
                    step="any"
                    placeholder="Ex: 500 ou 1"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                    className="mt-1 rounded-xl bg-nura-slate-50 border-nura-slate-200 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="unit" className="text-xs font-semibold text-nura-slate-700">
                    Unidade *
                  </Label>
                  <Select value={unit} onValueChange={(val: DosageUnit) => setUnit(val)}>
                    <SelectTrigger className="mt-1 rounded-xl bg-nura-slate-50 border-nura-slate-200 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border-nura-slate-200">
                      {DOSAGE_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value} className="text-xs sm:text-sm">
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="instructions" className="text-xs font-semibold text-nura-slate-700">
                  Instruções de Uso (Opcional)
                </Label>
                <Input
                  id="instructions"
                  placeholder="Ex: Tomar se tiver dor ou febre"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="mt-1 rounded-xl bg-nura-slate-50 border-nura-slate-200 text-sm"
                />
              </div>
            </div>

            <hr className="border-nura-slate-200 my-2" />

            {/* Seção 2: Frequência e Horários */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-nura-slate-900 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-nura-teal-600" />
                <span>Frequência de Uso</span>
              </div>

              <div>
                <Label className="text-xs font-semibold text-nura-slate-700">Tipo de Agendamento</Label>
                <Select
                  value={scheduleType}
                  onValueChange={(val: ScheduleType) => setScheduleType(val)}
                >
                  <SelectTrigger className="mt-1 rounded-xl bg-nura-slate-50 border-nura-slate-200 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl border-nura-slate-200">
                    <SelectItem value="as_needed" className="text-xs sm:text-sm">
                      Sob Demanda (Conforme necessário)
                    </SelectItem>
                    <SelectItem value="fixed_interval" className="text-xs sm:text-sm">
                      Intervalo Fixo (De X em X horas)
                    </SelectItem>
                    <SelectItem value="specific_times" className="text-xs sm:text-sm">
                      Horários Específicos do Dia
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Opção: Intervalo Fixo com Horário Inicial */}
              {scheduleType === "fixed_interval" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="intervalHours" className="text-xs font-semibold text-nura-slate-700">
                      Intervalo (Horas)
                    </Label>
                    <Input
                      id="intervalHours"
                      type="number"
                      min="1"
                      max="24"
                      placeholder="Ex: 8"
                      value={intervalHours}
                      onChange={(e) => setIntervalHours(e.target.value === "" ? "" : Number(e.target.value))}
                      required
                      className="mt-1 rounded-xl bg-nura-slate-50 border-nura-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="firstDoseTime" className="text-xs font-semibold text-nura-slate-700">
                      Horário 1ª Dose
                    </Label>
                    <Input
                      id="firstDoseTime"
                      type="time"
                      value={firstDoseTime}
                      onChange={(e) => setFirstDoseTime(e.target.value)}
                      required
                      className="mt-1 rounded-xl bg-nura-slate-50 border-nura-slate-200 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Opção: Horários Específicos */}
              {scheduleType === "specific_times" && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-nura-slate-700">
                    Horários Definidos
                  </Label>
                  {specificTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        required
                        className="rounded-xl bg-nura-slate-50 border-nura-slate-200 text-sm"
                      />
                      {specificTimes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSpecificTime(index)}
                          className="text-rose-500 hover:bg-rose-50 rounded-xl h-9 w-9 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSpecificTime}
                    className="w-full rounded-xl border-dashed border-nura-slate-300 text-xs font-medium text-nura-slate-600 hover:bg-nura-slate-50 cursor-pointer mt-1"
                  >
                    + Adicionar outro horário
                  </Button>
                </div>
              )}
            </div>

            <hr className="border-nura-slate-200 my-2" />

            {/* Seção 3: Estoque Inicial */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-nura-slate-900 uppercase tracking-wider">
                <Package className="w-4 h-4 text-nura-teal-600" />
                <span>Estoque Inicial</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="initialQuantity" className="text-xs font-semibold text-nura-slate-700">
                    Qtd. em Mãos *
                  </Label>
                  <Input
                    id="initialQuantity"
                    type="number"
                    min="0"
                    placeholder="Ex: 20"
                    value={initialQuantity}
                    onChange={(e) =>
                      setInitialQuantity(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    required
                    className="mt-1 rounded-xl bg-nura-slate-50 border-nura-slate-200 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="minimumThreshold" className="text-xs font-semibold text-nura-slate-700">
                    Alerta Mínimo *
                  </Label>
                  <Input
                    id="minimumThreshold"
                    type="number"
                    min="1"
                    placeholder="Ex: 5"
                    value={minimumThreshold}
                    onChange={(e) =>
                      setMinimumThreshold(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    required
                    className="mt-1 rounded-xl bg-nura-slate-50 border-nura-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="pt-4 border-t border-nura-slate-200 flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl border-nura-slate-200 text-xs sm:text-sm cursor-pointer flex-1"
          >
            Cancelar
          </Button>
          <Button
            form="add-medication-form"
            type="submit"
            disabled={isSubmitting}
            className="bg-nura-teal-600 hover:bg-nura-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer flex-1"
          >
            {isSubmitting ? "Salvando..." : "Salvar Remédio"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}