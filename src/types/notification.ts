export type NotificationType = 'ALERT' | 'WARNING' | 'SUCCESS' | 'INFO';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
}
