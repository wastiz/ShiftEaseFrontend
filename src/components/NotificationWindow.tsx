import { Bell, X, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/api/notification";

interface NotificationWindowProps {
  className?: string;
  onClose?: () => void;
}

export default function NotificationWindow({
  className,
  onClose,
}: NotificationWindowProps) {
  const t = useTranslations("notifications");
  const { data: notifications, isLoading } = useNotifications();
  console.log(notifications);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-80 bg-black/70 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-white/10 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold">{t("title")}</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-orange-500 text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title={t("markAllRead")}
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-white/20 border-t-orange-400 rounded-full animate-spin" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
              <Bell className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-white/80 text-sm font-medium mb-1">
              {t("noNew")}
            </p>
            <p className="text-white/60 text-xs">{t("allCaughtUp")}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors",
                  !notification.isRead && "bg-white/[0.03]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <p className="text-sm font-medium text-white truncate">
                        {notification.title}
                      </p>
                    )}
                    <p className="text-xs text-white/70 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead.mutate(notification.id)}
                      className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                      title={t("markRead")}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!notification.isRead && (
                    <div className="shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-1.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
