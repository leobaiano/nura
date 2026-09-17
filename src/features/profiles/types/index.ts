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