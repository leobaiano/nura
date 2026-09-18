import { Medication } from "../types";

export interface ScheduledDoseItem {
  medication: Medication;
  scheduledTime?: string; // Formato "HH:mm" (se houver horário agendado)
  scheduledDateTime?: Date; // Data e hora completas para comparação
}

export const scheduleService = {
  /**
   * Gera a lista de doses projetadas para a data atual com base no tipo de agendamento.
   */
  getScheduledDosesForDate(medications: Medication[], targetDate: Date = new Date()): ScheduledDoseItem[] {
    const items: ScheduledDoseItem[] = [];

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const day = targetDate.getDate();

    medications.forEach((med) => {
      if (!med.active) return;

      // 1. SOB DEMANDA (as_needed): Gerado como 1 item genérico sem horário fixo
      if (med.scheduleType === "as_needed" || !med.scheduleType) {
        items.push({
          medication: med,
        });
        return;
      }

      // 2. HORÁRIOS ESPECÍFICOS (specific_times)
      if (med.scheduleType === "specific_times" && med.specificTimes && med.specificTimes.length > 0) {
        med.specificTimes.forEach((timeStr) => {
          const [hours, minutes] = timeStr.split(":").map(Number);
          const scheduledDateTime = new Date(year, month, day, hours, minutes, 0, 0);

          items.push({
            medication: med,
            scheduledTime: timeStr,
            scheduledDateTime,
          });
        });
        return;
      }

      // 3. INTERVALO FIXO (fixed_interval)
      if (med.scheduleType === "fixed_interval" && med.intervalHours && med.intervalHours > 0) {
        // Usa o primeiro horário definido em specificTimes (ou padrão 08:00)
        const startTimeStr = med.specificTimes?.[0] || "08:00";
        const [startHours, startMinutes] = startTimeStr.split(":").map(Number);

        let current = new Date(year, month, day, startHours, startMinutes, 0, 0);

        // Se o horário inicial for posterior ao início do dia, podemos retroceder para pegar o ciclo desde 00:00
        while (current.getHours() >= med.intervalHours) {
          current = new Date(current.getTime() - med.intervalHours * 60 * 60 * 1000);
        }

        // Gera todas as ocorrências dentro do mesmo dia
        while (current.getDate() === day && current.getMonth() === month) {
          const timeStr = `${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`;

          items.push({
            medication: med,
            scheduledTime: timeStr,
            scheduledDateTime: new Date(current),
          });

          // Avança para a próxima janela
          current = new Date(current.getTime() + med.intervalHours * 60 * 60 * 1000);
        }
      }
    });

    // Ordena por horário agendado (doses com horário primeiro, sob demanda por último)
    return items.sort((a, b) => {
      if (!a.scheduledDateTime) return 1;
      if (!b.scheduledDateTime) return -1;
      return a.scheduledDateTime.getTime() - b.scheduledDateTime.getTime();
    });
  },
};