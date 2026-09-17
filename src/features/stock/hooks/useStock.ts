import { useLiveQuery } from "dexie-react-hooks";
import { stockService } from "../services/stockService";
import { DosageUnit } from "@/features/medications/types";

export function useStock(medicationId?: number) {
  const stock = useLiveQuery(async () => {
    if (!medicationId) return undefined;
    return await stockService.getByMedicationId(medicationId);
  }, [medicationId]);

  const saveStock = async (
    currentQuantity: number,
    minimumThreshold: number,
    unit: DosageUnit
  ) => {
    if (!medicationId) return;
    return await stockService.setStock({
      medicationId,
      currentQuantity,
      minimumThreshold,
      unit,
    });
  };

  const addStockQuantity = async (amount: number) => {
    if (!medicationId) return;
    return await stockService.addQuantity(medicationId, amount);
  };

  return {
    stock,
    isLoading: stock === undefined,
    saveStock,
    addStockQuantity,
  };
}