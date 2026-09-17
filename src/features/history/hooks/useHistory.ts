import { useLiveQuery } from "dexie-react-hooks";
import { historyService } from "../services/historyService";
import { DoseLog } from "../types";

export function useHistory(profileId?: number) {
  const history = useLiveQuery(async () => {
    if (!profileId) return [];
    return await historyService.getByProfile(profileId);
  }, [profileId]);

  const registerDose = async (
    data: Omit<DoseLog, "id" | "createdAt">
  ) => {
    return await historyService.logDose(data);
  };

  const removeLog = async (id: number) => {
    return await historyService.deleteLog(id);
  };

  return {
    history: history ?? [],
    isLoading: history === undefined,
    registerDose,
    removeLog,
  };
}