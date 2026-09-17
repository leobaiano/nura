import { useLiveQuery } from "dexie-react-hooks";
import { profileService } from "../services/profileService";
import { Profile } from "../types";

export function useProfiles() {
  // A liveQuery faz puramente a leitura (Read-Only) dos perfis
  const profiles = useLiveQuery(async () => {
    return await profileService.getAll();
  }, []);

  const addProfile = async (
    name: string,
    role: Profile["role"] = "member"
  ) => {
    return await profileService.create({ name, role });
  };

  const removeProfile = async (id: number) => {
    return await profileService.delete(id);
  };

  return {
    profiles: profiles ?? [],
    isLoading: profiles === undefined,
    addProfile,
    removeProfile,
  };
}