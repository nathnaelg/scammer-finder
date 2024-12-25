import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

// Define the Notification type
type Notification = {
  id: number;
  message: string;
};

export default function Notification() {
  // Explicitly type the state as an array of Notification
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Simulate API call to fetch notifications
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNotifications([
        { id: 1, message: "New scam report submitted for review" },
        { id: 2, message: "Your reported scam has been confirmed" },
      ]);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const shownIds = new Set<number>();
    notifications.forEach((notification) => {
      if (!shownIds.has(notification.id)) {
        toast({
          title: "New Notification",
          description: notification.message,
        });
        shownIds.add(notification.id);
      }
    });
  }, [notifications]);

  return null; // This component doesn't render anything, it just shows toasts
}
