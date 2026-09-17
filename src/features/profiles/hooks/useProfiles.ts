import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { profileService } from "../services/profileService";
import { Profile } from "../types";

export function useProfiles() {
  // Garante a existência do perfil padrão fora do fluxo do liveQuery
  useEffect(() => {
    profileService.ensureDefaultProfile().catch((err) => {
      console.error("Erro ao garantir perfil padrão:", err);
    });
  }, []);

  // A liveQuery agora faz puramente LEITURA (Read-Only)
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