"use client";

import { useEffect, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";

interface LocationData {
  latitude: number;
  longitude: number;
}

interface UseLocationOptions {
  orderId: string;
  driverId?: string;
  onLocationUpdate?: (data: LocationData & { driverId: string; timestamp: number }) => void;
  enabled?: boolean;
  saveToDb?: boolean;
}

export const useLocationSender = ({
  orderId,
  driverId,
  enabled = true,
  saveToDb = true,
}: UseLocationOptions) => {
  const socketRef = useRef(getSocket());

  const sendLocation = useCallback(
    async (latitude: number, longitude: number) => {
      const socket = socketRef.current;
      if (socket?.connected && driverId) {
        socket.emit("update-location", {
          orderId,
          latitude,
          longitude,
          driverId,
        });

        if (saveToDb) {
          try {
            await fetch("/api/user/update-location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ latitude, longitude }),
            });
          } catch (error) {
            console.error("Error saving location to DB:", error);
          }
        }
      }
    },
    [orderId, driverId, saveToDb]
  );

  useEffect(() => {
    if (!enabled || !orderId) return;

    const socket = socketRef.current;
    socket.emit("join-room", orderId);

    return () => {
      socket.emit("leave-room", orderId);
    };
  }, [orderId, enabled]);

  return { sendLocation };
};

export const useLocationReceiver = ({
  orderId,
  onLocationUpdate,
  enabled = true,
}: UseLocationOptions) => {
  const socketRef = useRef(getSocket());

  useEffect(() => {
    if (!enabled || !orderId) return;

    const socket = socketRef.current;

    const handleLocationUpdated = (data: LocationData & { driverId: string; timestamp: number }) => {
      onLocationUpdate?.(data);
    };

    socket.emit("join-room", orderId);
    socket.on("location-updated", handleLocationUpdated);

    return () => {
      socket.emit("leave-room", orderId);
      socket.off("location-updated", handleLocationUpdated);
    };
  }, [orderId, onLocationUpdate, enabled]);
};
