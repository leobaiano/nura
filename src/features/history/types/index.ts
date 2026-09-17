export type DoseStatus = "taken" | "skipped" | "late";

export interface DoseLog {
    id?: number;
    medicationId: number;
    profileId: number;
    scheduledTime: Date; // Horário previsto para a dose
    takenAt?: Date;      // Horário real em que foi registrada como tomada
    status: DoseStatus;  // Status da adesão
    notes?: string;      // Observações opcionais (ex: "Tomado após refeição")
    createdAt: Date;
}