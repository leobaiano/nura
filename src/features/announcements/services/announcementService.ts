import { AnnouncementData } from "../types";

export const announcementService = {
  async getActiveAnnouncement(): Promise<AnnouncementData | null> {
    try {
      const response = await fetch("/announcements.json");
      if (!response.ok) return null;
      const data: AnnouncementData = await response.json();

      if (!data.active) return null;
      return data;
    } catch (error) {
      console.error("Erro ao buscar anúncios:", error);
      return null;
    }
  },
};