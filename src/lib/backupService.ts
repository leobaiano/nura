import { db } from "./db";

export interface NuraBackupData {
  version: number;
  exportedAt: string;
  data: {
    profiles: any[];
    medications: any[];
    stocks: any[];
    doseLogs: any[];
  };
}

export const backupService = {
  /**
   * Exporta todos os dados do Dexie.js para um objeto JSON estruturado
   */
  async exportData(): Promise<NuraBackupData> {
    const profiles = await db.profiles.toArray();
    const medications = await db.medications.toArray();
    const stocks = await db.stocks.toArray();
    const doseLogs = await db.doseLogs.toArray();

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        profiles,
        medications,
        stocks,
        doseLogs,
      },
    };
  },

  /**
   * Dispara o download automático do ficheiro de backup JSON no navegador
   */
  async downloadBackup(): Promise<void> {
    const backup = await this.exportData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `nura-backup-${dateStr}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Importa e restaura os dados na base de dados de forma transacional
   */
  async restoreBackup(jsonString: string): Promise<boolean> {
    try {
      const parsed: NuraBackupData = JSON.parse(jsonString);

      // Validação básica do formato do backup
      if (!parsed.version || !parsed.data || !parsed.data.profiles) {
        throw new Error("Formato de ficheiro de backup inválido.");
      }

      await db.transaction(
        "rw",
        [db.profiles, db.medications, db.stocks, db.doseLogs],
        async () => {
          // Limpa as tabelas atuais antes de restaurar
          await db.doseLogs.clear();
          await db.stocks.clear();
          await db.medications.clear();
          await db.profiles.clear();

          // Restaura os dados (convertendo strings de data de volta para objetos Date quando necessário)
          if (parsed.data.profiles.length > 0) {
            await db.profiles.bulkAdd(parsed.data.profiles);
          }

          if (parsed.data.medications.length > 0) {
            const meds = parsed.data.medications.map((m) => ({
              ...m,
              createdAt: new Date(m.createdAt),
            }));
            await db.medications.bulkAdd(meds);
          }

          if (parsed.data.stocks.length > 0) {
            const stocks = parsed.data.stocks.map((s) => ({
              ...s,
              updatedAt: new Date(s.updatedAt),
            }));
            await db.stocks.bulkAdd(stocks);
          }

          if (parsed.data.doseLogs.length > 0) {
            const logs = parsed.data.doseLogs.map((l) => ({
              ...l,
              scheduledTime: new Date(l.scheduledTime),
              takenAt: l.takenAt ? new Date(l.takenAt) : undefined,
              createdAt: new Date(l.createdAt),
            }));
            await db.doseLogs.bulkAdd(logs);
          }
        }
      );

      return true;
    } catch (error) {
      console.error("Erro ao restaurar backup:", error);
      throw error;
    }
  },
};