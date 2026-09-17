export type ProfileRole = "admin" | "member";

export interface Profile {
  id?: number;
  name: string;
  avatarUrl?: string;
  role: ProfileRole;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Stock {
  id?: number;
  medicationId: number;
  currentQuantity: number;
  minimumThreshold: number;
  unit: DosageUnit;
  updatedAt: Date;
}

export type DoseStatus = "taken" | "skipped" | "late";

export interface DoseLog {
  id?: number;
  medicationId: number;
  profileId: number;
  scheduledTime: Date;
  takenAt?: Date;
  status: DoseStatus;
  notes?: string;
  createdAt: Date;
}