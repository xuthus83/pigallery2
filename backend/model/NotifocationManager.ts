import {NotificationDTO, NotificationType} from "../../common/entities/NotificationDTO";
export class NotificationManager {
  public static notifications: NotificationDTO[] = [];
  public static HasNotification: NotificationDTO[] =
    [
      {
        type: NotificationType.info,
        message: "There are unhandled server notification. Login as Administrator to handle them."
      }
    ];


  public static error(message: string, details?: any) {
    NotificationManager.notifications.push({
      type: NotificationType.error,
      message: message,
      details: details
    });
  }

  public static warning(message: string, details?: any) {
    NotificationManager.notifications.push({
      type: NotificationType.warning,
      message: message,
      details: details
    });
  }
}
