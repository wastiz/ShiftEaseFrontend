import { memo } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationWindowProps {
  className?: string;
  onClose?: () => void;
}

export default function NotificationWindow({
  className,
  onClose,
}: NotificationWindowProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in-0 zoom-in-95 w-64 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-xl p-0 duration-200",
        className
      )}
    >
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Notifications</h3>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
            <Bell className="w-6 h-6 text-orange-400" />
          </div>
          <p className="text-white/80 text-sm font-medium mb-1">
            No new notifications
          </p>
          <p className="text-white/60 text-xs">You're all caught up!</p>
        </div>
      </div>
    </div>
  );
}
