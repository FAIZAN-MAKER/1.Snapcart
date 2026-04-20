"use client";

import { useEffect, useState } from "react";
import { useLocationSender } from "@/lib/useLocation";

interface DeliveryBoyProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  orderId?: string;
}

export default function DeliveryBoy({ user, orderId }: DeliveryBoyProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { sendLocation } = useLocationSender({
    orderId: orderId || "delivery-" + user._id,
    driverId: user._id,
    saveToDb: true,
  });

  useEffect(() => {
    if (!isTracking || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        sendLocation(latitude, longitude);
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, sendLocation]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Delivery Boy Location</h2>
      <div className="mb-4">
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`px-4 py-2 rounded-lg ${
            isTracking ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {isTracking ? "Stop Tracking" : "Start Tracking"}
        </button>
      </div>
      {currentLocation && (
        <p className="text-sm text-gray-600">
          Current: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
