"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getSocket } from "@/lib/socket";
import axios from "axios";
import { Loader2, Navigation } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Destination {
  latitude: number;
  longitude: number;
  address: string;
}

interface RouteInfo {
  distanceMeters: number;
  etaMinutes: number;
  polyline: L.LatLngExpression[];
}

interface DeliveryMapProps {
  orderId: string;
  destination: Destination;
  isPaid?: boolean;
  onDelivered?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Mark as delivered when driver is within this many metres of destination */
const DELIVERY_RADIUS_M = 50;

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 10_000,
  timeout: 10_000,
};

// ─── Map icons ────────────────────────────────────────────────────────────────

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

// ─── OSRM route fetcher ───────────────────────────────────────────────────────

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

// ─── Child hooks / controller components ─────────────────────────────────────

/** Smoothly re-centers the map on a new coordinate */
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

/** Fits map bounds to show both markers on initial load */
function MapBoundsController({ driverLoc, destCoords }: { driverLoc: L.LatLngTuple | null; destCoords: L.LatLngTuple }) {
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

/** Draws (and cleans up) the route polyline */
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
    return () => { map.removeLayer(line); };
  }, [positions, map]);

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DeliveryMap({ orderId, destination, isPaid, onDelivered }: DeliveryMapProps) {
  const [driverLocation, setDriverLocation] = useState<L.LatLngTuple | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isNearDestination, setIsNearDestination] = useState(false);
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const destCoords: L.LatLngTuple = [destination.latitude, destination.longitude];
  const socketRef = useRef(getSocket());
  const watchIdRef = useRef<number | null>(null);
  // Track whether delivered has already been triggered to avoid double-firing
  const deliveredRef = useRef(false);

  // ── Join socket room ──

  useEffect(() => {
  const socket = socketRef.current;
  if (!socket) return;

  if (socket.connected) socket.emit("join-room", orderId);
  return () => { socket.emit("leave-room", orderId); };
}, [orderId]);

  // ── Location tracking ──

  const handlePositionUpdate = useCallback(
    async (pos: GeolocationPosition) => {
      const loc: L.LatLngTuple = [pos.coords.latitude, pos.coords.longitude];
      setDriverLocation(loc);
      setGeoError(null);

      // Broadcast to socket
      const socket = socketRef.current;
if (socket?.connected) {
        socket.emit("update-location", {
          orderId,
          latitude: loc[0],
          longitude: loc[1],
        });
      }

      // Fetch route
      try {
        const info = await fetchRoute(loc, destCoords);
        if (info) {
          setRouteInfo(info);
          if (info.distanceMeters <= DELIVERY_RADIUS_M && !deliveredRef.current) {
            setIsNearDestination(true);
          }
        }
      } catch (err) {
        console.error("[DeliveryMap] Route fetch failed:", err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderId, destination.latitude, destination.longitude]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (err) => setGeoError(err.message),
      GEOLOCATION_OPTIONS
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [handlePositionUpdate]);

  // ── Mark delivered ──

  const handleMarkDelivered = async () => {
    if (deliveredRef.current || isMarkingDelivered) return;
    try {
      setIsMarkingDelivered(true);
      const updates: { status: string; isPaid?: boolean } = { status: "delivered" };
      if (!isPaid) updates.isPaid = true;
      await axios.patch(`/api/admin/manage-orders/${orderId}`, updates);
      deliveredRef.current = true;
      onDelivered?.();
    } catch (err) {
      console.error("[DeliveryMap] Mark delivered failed:", err);
    } finally {
      setIsMarkingDelivered(false);
    }
  };

  // ── Derived display values ──

  const distanceLabel = routeInfo
    ? routeInfo.distanceMeters >= 1000
      ? `${(routeInfo.distanceMeters / 1000).toFixed(1)} km`
      : `${routeInfo.distanceMeters} m`
    : null;

  const etaLabel = routeInfo ? `~${routeInfo.etaMinutes} min` : null;

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
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

        {/* Destination marker */}
        <Marker position={destCoords} icon={destinationIcon}>
          <Popup>
            <div className="text-center text-sm">
              <p className="font-semibold">Delivery Location</p>
              <p className="text-gray-500 text-xs mt-1">{destination.address}</p>
            </div>
          </Popup>
        </Marker>

        {/* Driver marker */}
        {driverLocation && (
          <Marker position={driverLocation} icon={driverIcon}>
            <Popup>
              <div className="text-center text-sm">
                <p className="font-semibold">Your Location</p>
                <p className="text-gray-500 text-xs">Live tracking active</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {routeInfo && routeInfo.polyline.length > 0 && (
          <RoutePolyline positions={routeInfo.polyline} />
        )}
      </MapContainer>

      {/* ── Overlay HUD ── */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl pointer-events-auto">
          {geoError ? (
            <p className="text-xs text-red-500 text-center font-medium">{geoError}</p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              {/* Status dot + distance */}
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    driverLocation ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {distanceLabel ?? "Locating…"}
                  </p>
                  {etaLabel && (
                    <p className="text-xs text-gray-400 leading-tight">{etaLabel} ETA</p>
                  )}
                </div>
              </div>

              {/* CTA */}
              {isNearDestination ? (
                <button
                  onClick={handleMarkDelivered}
                  disabled={isMarkingDelivered}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-md hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isMarkingDelivered ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  Mark Delivered
                </button>
              ) : (
                <p className="text-xs text-gray-400 text-right leading-snug">
                  Get within {DELIVERY_RADIUS_M}m<br />to mark delivered
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}