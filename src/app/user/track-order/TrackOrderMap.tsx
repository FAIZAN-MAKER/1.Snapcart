"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getSocket } from "@/lib/socket";
import { Loader2, MapPin } from "lucide-react";

interface RouteInfo {
  distanceMeters: number;
  etaMinutes: number;
  polyline: L.LatLngExpression[];
}

interface Props {
  orderId: string;
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 10000,
};

const destinationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/10484/10484697.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -44],
});

const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/103/103512.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

async function fetchRoute(
  start: L.LatLngTuple,
  end: L.LatLngTuple
): Promise<RouteInfo | null> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start[1]},${start[0]};${end[1]},${end[0]}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM ${res.status}`);

  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route) return null;

  return {
    distanceMeters: Math.round(route.distance),
    etaMinutes: Math.round(route.duration / 60),
    polyline: (route.geometry.coordinates as [number, number][]).map(
      ([lng, lat]) => [lat, lng] as L.LatLngTuple
    ),
  };
}

function MapCenterController({ center }: { center: L.LatLngTuple | null }) {
  const map = useMap();
  const prevCenter = useRef<L.LatLngTuple | null>(null);

  useEffect(() => {
    if (!center) return;
    const [lat, lng] = center;
    const [prevLat, prevLng] = prevCenter.current ?? [null, null];
    if (lat !== prevLat || lng !== prevLng) {
      map.setView(center, map.getZoom(), { animate: true });
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

function MapBoundsController({
  driverLoc,
  destCoords,
}: {
  driverLoc: L.LatLngTuple | null;
  destCoords: L.LatLngTuple;
}) {
  const map = useMap();
  const hasFitBounds = useRef(false);

  useEffect(() => {
    if (hasFitBounds.current || !driverLoc) return;
    hasFitBounds.current = true;
    const bounds = L.latLngBounds([driverLoc, destCoords]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [driverLoc, destCoords, map]);

  return null;
}

function RoutePolyline({ positions }: { positions: L.LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (!positions.length) return;
    const line = L.polyline(positions, {
      color: "#10b981",
      weight: 5,
      opacity: 0.85,
      lineJoin: "round",
    }).addTo(map);
    return () => {
      map.removeLayer(line);
    };
  }, [positions, map]);

  return null;
}

export default function TrackOrderMap({ orderId, destination }: Props) {
  const [driverLocation, setDriverLocation] = useState<L.LatLngTuple | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const socketRef = useRef(getSocket());
  const watchIdRef = useRef<number | null>(null);

  // Socket: join room and listen for driver location
  useEffect(() => {
    const socket = socketRef.current;

    socket.emit("join-room", orderId);
    socket.on("location-updated", (data: { latitude: number; longitude: number }) => {
      setDriverLocation([data.latitude, data.longitude]);
    });

    return () => {
      socket.emit("leave-room", orderId);
      socket.off("location-updated");
    };
  }, [orderId]);

  // Geolocation watch (user's own location — kept for geoError feedback)
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      () => {
        setGeoError(null);
      },
      (err) => setGeoError(err.message),
      GEOLOCATION_OPTIONS
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Fetch route whenever driver location updates
  useEffect(() => {
    if (!driverLocation) return;

    const fetchRouteData = async () => {
      try {
        const info = await fetchRoute(
          [driverLocation[0], driverLocation[1]],
          [destination.latitude, destination.longitude]
        );
        if (info) setRouteInfo(info);
      } catch (err) {
        console.error("[TrackOrder] Route fetch failed:", err);
      }
    };

    fetchRouteData();
  }, [driverLocation, destination]);

  const destCoords: L.LatLngTuple = [destination.latitude, destination.longitude];

  const distanceLabel = routeInfo
    ? routeInfo.distanceMeters >= 1000
      ? `${(routeInfo.distanceMeters / 1000).toFixed(1)} km`
      : `${routeInfo.distanceMeters} m`
    : null;

  const etaLabel = routeInfo ? `~${routeInfo.etaMinutes} min` : null;

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={destCoords}
        zoom={15}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterController center={driverLocation} />
        <MapBoundsController driverLoc={driverLocation} destCoords={destCoords} />

        <Marker position={destCoords} icon={destinationIcon}>
          <Popup>
            <div className="text-center text-sm">
              <p className="font-semibold">Delivery Location</p>
              <p className="text-gray-500 text-xs mt-1">{destination.address}</p>
            </div>
          </Popup>
        </Marker>

        {driverLocation && (
          <Marker position={driverLocation} icon={driverIcon}>
            <Popup>
              <div className="text-center text-sm">
                <p className="font-semibold">Delivery Partner</p>
                <p className="text-gray-500 text-xs">Live tracking</p>
              </div>
            </Popup>
          </Marker>
        )}

        {routeInfo && routeInfo.polyline.length > 0 && (
          <RoutePolyline positions={routeInfo.polyline} />
        )}
      </MapContainer>

      {/* Overlay info bar */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl">
          {geoError ? (
            <p className="text-xs text-red-500 text-center font-medium">{geoError}</p>
          ) : !driverLocation ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              <p className="text-sm text-gray-500">
                Waiting for delivery partner location...
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {distanceLabel ?? "Calculating..."}
                  </p>
                  {etaLabel && (
                    <p className="text-xs text-gray-400">{etaLabel} away</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                Destination
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}