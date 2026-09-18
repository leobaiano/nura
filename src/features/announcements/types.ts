export interface DismissedAnnouncement {
  id?: number;
  announcementId: string;
  dismissedAt: Date;
}

export interface AnnouncementData {
  id: string;
  title: string;
  message: string;
  actionUrl?: string;
  active: boolean;
}