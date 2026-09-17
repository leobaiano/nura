import { DosageUnit } from "@/features/medications/types";

export interface Stock {
  id?: number;
  medicationId: number;
  currentQuantity: number;
  minimumThreshold: number;
  unit: DosageUnit;
  updatedAt: Date;
}