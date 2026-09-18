import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { medicationService } from "../services/medicationService";
import { DosageUnit, ScheduleType } from "../types";

export interface CreateMedicationWithStockInput {
  name: string;
  dosage: number;
  unit: DosageUnit;
  instructions?: string;
  scheduleType?: ScheduleType;
  intervalHours?: number;
  specificTimes?: string[];
  initialQuantity: number;
  minimumThreshold: number;
}

export function useMedications(profileId?: number) {
  // Busca medicamentos junto com o estoque correspondente no IndexedDB
  const medicationsWithStock = useLiveQuery(async () => {
    if (!profileId) return [];

    const meds = await medicationService.getByProfile(profileId);
    const medIds = meds
      .map((m) => m.id!)
      .filter((id): id is number => id !== undefined);

    const stocks = await db.stocks
      .where("medicationId")
      .anyOf(medIds)
      .toArray();

    return meds.map((med) => {
      const stock = stocks.find((s) => s.medicationId === med.id);
      return {
        ...med,
        stock,
      };
    });
  }, [profileId]);

  // Criação atômica: Cadastra o remédio e o estoque inicial em conjunto
  const addMedication = async (data: CreateMedicationWithStockInput) => {
    if (!profileId) throw new Error("Nenhum perfil ativo selecionado.");

    return await db.transaction("rw", [db.medications, db.stocks], async () => {
      const now = new Date();

      // 1. Cria o medicamento respeitando a interface Medication
      const medicationId = await db.medications.add({
        profileId,
        name: data.name,
        dosage: data.dosage,
        unit: data.unit,
        instructions: data.instructions,
        scheduleType: data.scheduleType ?? "as_needed",
        intervalHours: data.intervalHours,
        specificTimes: data.specificTimes,
        active: true,
        createdAt: now,
        updatedAt: now,
      });

      // 2. Cria o estoque inicial associado
      await db.stocks.add({
        medicationId: medicationId as number,
        currentQuantity: data.initialQuantity,
        minimumThreshold: data.minimumThreshold,
        unit: data.unit,
        updatedAt: now,
      });

      return medicationId;
    });
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    return await medicationService.toggleActive(id, !currentStatus);
  };

  const removeMedication = async (id: number) => {
    return await medicationService.delete(id);
  };

  return {
    medications: medicationsWithStock ?? [],
    isLoading: medicationsWithStock === undefined,
    addMedication,
    toggleStatus,
    removeMedication,
  };
}