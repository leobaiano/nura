export type DosageUnit = "mg" | "ml" | "gotas" | "comprimido" | "capsula" | "unidade";

export type ScheduleType = "fixed_interval" | "specific_times" | "as_needed";

export interface Medication {
  id?: number;
  profileId: number;
  name: string;
  dosage: number;
  unit: DosageUnit;
  instructions?: string;
  scheduleType: ScheduleType;
  intervalHours?: number;
  specificTimes?: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}