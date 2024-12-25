"use client";

import { useState, useEffect } from "react";
import { messaging } from "@/lib/firebase";
import { getToken, onMessage, Messaging } from "firebase/messaging";
import { toast } from "@/components/ui/use-toast";

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        if (!messaging) {
          console.warn("Firebase Messaging is not supported in this environment.");
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          if (currentToken) {
            setToken(currentToken);
            // Send this token to your server to associate it with the user
            await fetch("/api/notifications/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token: currentToken }),
            });
          }
        } else {
          console.warn("Notification permission denied.");
        }
      } catch (error) {
        console.error("An error occurred while retrieving token:", error);
      }
    };

    requestPermission();

    const unsubscribe = messaging
      ? onMessage(messaging, (payload) => {
          toast({
            title: payload.notification?.title || "New Notification",
            description: payload.notification?.body,
          });
        })
      : () => {};

    return () => {
      unsubscribe();
    };
  }, []);

  return { token };
}
