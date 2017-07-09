export enum NotificationType{
  error, warning, info
}

export interface NotificationDTO {
  type: NotificationType;
  message: string;
  details?: any;
}
