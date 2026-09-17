import { useLiveQuery } from "dexie-react-hooks";
import { medicationService } from "../services/medicationService";
import { Medication } from "../types";

export function useMedications(profileId?: number) {
  const medications = useLiveQuery(async () => {
    if (!profileId) return [];
    return await medicationService.getByProfile(profileId);
  }, [profileId]);

  const addMedication = async (
    data: Omit<Medication, "id" | "createdAt" | "updatedAt">
  ) => {
    return await medicationService.create(data);
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    return await medicationService.toggleActive(id, !currentStatus);
  };

  const removeMedication = async (id: number) => {
    return await medicationService.delete(id);
  };

  return {
    medications: medications ?? [],
    isLoading: medications === undefined,
    addMedication,
    toggleStatus,
    removeMedication,
  };
}