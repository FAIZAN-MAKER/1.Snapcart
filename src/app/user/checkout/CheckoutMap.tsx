"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { Navigation, Search, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Fix Leaflet default marker icons (Next.js issue) ────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom green marker
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface CheckoutMapProps {
  initialCoords: [number, number];
  onMarkerMove: (lat: number, lng: number) => void;
}

// ─── Sub-component: fly map to coords ────────────────────────────────────────
const FlyTo = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.flyTo(coords, map.getZoom(), { duration: 1.2 }); }, [coords, map]);
  return null;
};

// ─── Sub-component: draggable marker ─────────────────────────────────────────
const DraggableMarker = ({
  position,
  onDragEnd,
}: {
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}) => {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onDragEnd(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      position={position}
      draggable
      icon={greenIcon}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const m = markerRef.current;
          if (m) {
            const { lat, lng } = m.getLatLng();
            onDragEnd(lat, lng);
          }
        },
      }}
    />
  );
};

// ─── Main Map Component ───────────────────────────────────────────────────────
const CheckoutMap = ({ initialCoords, onMarkerMove }: CheckoutMapProps) => {
  const [markerPos, setMarkerPos] = useState<[number, number]>(initialCoords);
  const [flyTarget, setFlyTarget] = useState<[number, number]>(initialCoords);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locateHovered, setLocateHovered] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleMarkerMove = (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    setFlyTarget([lat, lng]);
    onMarkerMove(lat, lng);
  };

  // ── Search via Nominatim ──────────────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await res.json();
      if (data.length === 0) {
        setSearchError("Location not found. Try a different search.");
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      handleMarkerMove(lat, lng);
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // ── Locate me ────────────────────────────────────────────────────────────
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleMarkerMove(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
      },
      () => setIsLocating(false),
    );
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      {/* Search bar — floats above map */}
      <div className="absolute top-3 left-3 right-3 z-[1000]">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/95 backdrop-blur-md shadow-lg rounded-xl px-3 py-2 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchError(""); }}
              placeholder="Search city or area…"
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold text-sm px-4 rounded-xl shadow-lg transition-colors"
          >
            {isSearching
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
            {!isSearching && <span>Search</span>}
          </button>
        </form>
        {searchError && (
          <p className="text-xs text-red-500 bg-white/90 rounded-lg px-3 py-1.5 mt-1.5 shadow-sm">
            {searchError}
          </p>
        )}
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={initialCoords}
        zoom={14}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FlyTo coords={flyTarget} />
        <DraggableMarker position={markerPos} onDragEnd={handleMarkerMove} />
      </MapContainer>

      {/* Locate Me button — bottom right */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <button
          onClick={handleLocateMe}
          onMouseEnter={() => setLocateHovered(true)}
          onMouseLeave={() => setLocateHovered(false)}
          disabled={isLocating}
          className="flex items-center gap-2 bg-white shadow-lg border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 font-medium text-sm hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200"
          style={{ whiteSpace: "nowrap" }}
        >
          {isLocating
            ? <Loader2 className="w-4 h-4 animate-spin text-green-500" />
            : <Navigation className="w-4 h-4 text-green-500 shrink-0" />
          }
          <span
            className="overflow-hidden transition-all duration-300"
            style={{ maxWidth: locateHovered ? "140px" : "0px", opacity: locateHovered ? 1 : 0 }}
          >
            Use current location
          </span>
        </button>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <p className="text-[10px] bg-white/80 backdrop-blur-sm text-gray-500 px-2.5 py-1 rounded-lg shadow-sm">
          Click on map or drag marker to set location
        </p>
      </div>
    </div>
  );
};

export default CheckoutMap;
