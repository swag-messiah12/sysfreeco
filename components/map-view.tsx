"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Locate, Maximize2, Layers } from "lucide-react";
import { Restaurant } from "@/lib/types";
import { getVerdictBadge } from "@/lib/restaurant-utils";

// ─── City fly-to coordinates ──────────────────────────────────────────────────
export const CITY_COORDS: Record<string, { center: [number, number]; zoom: number }> = {
  all:           { center: [56.0, -96.0],       zoom: 4  },
  Toronto:       { center: [43.6532, -79.3832],  zoom: 12 },
  Hamilton:      { center: [43.2557, -79.8711],  zoom: 12 },
  Cambridge:     { center: [43.3924, -80.3580],  zoom: 13 },
  Ottawa:        { center: [45.4215, -75.6972],  zoom: 12 },
  Vancouver:     { center: [49.2827, -123.1207], zoom: 12 },
  Calgary:       { center: [51.0447, -114.0719], zoom: 12 },
  Edmonton:      { center: [53.5461, -113.4938], zoom: 12 },
  Montreal:      { center: [45.5017, -73.5673],  zoom: 12 },
  "Quebec City": { center: [46.8139, -71.2080],  zoom: 13 },
  Winnipeg:      { center: [49.8951, -97.1384],  zoom: 12 },
  Halifax:       { center: [44.6488, -63.5752],  zoom: 13 },
  Victoria:      { center: [48.4284, -123.3656], zoom: 13 },
};

// ─── Custom marker icon ───────────────────────────────────────────────────────
function makeIcon(color: string, selected: boolean): L.DivIcon {
  const size = selected ? 18 : 11;
  const ring = selected
    ? `<div class="marker-ring" style="border:2.5px solid ${color};color:${color};"></div>`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      ${ring}
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};
        border:${selected ? "2.5px solid #fff" : "2px solid rgba(255,255,255,0.9)"};
        box-shadow:0 2px 8px rgba(0,0,0,0.2)${selected ? `,0 0 0 3px ${color}40` : ""};
        transition:all 0.25s;
      "></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

// ─── Inner components (must live inside MapContainer) ─────────────────────────
function CaptureMap({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

function FlyTo({ restaurant, city }: { restaurant: Restaurant | null; city: string }) {
  const map = useMap();

  useEffect(() => {
    if (restaurant) {
      map.flyTo([restaurant.lat, restaurant.lng], 15, { duration: 0.8 });
    }
  }, [restaurant, map]);

  useEffect(() => {
    if (restaurant) return;
    const coords = CITY_COORDS[city] ?? CITY_COORDS.all;
    map.flyTo(coords.center, coords.zoom, { duration: 1 });
  }, [city, restaurant, map]);

  return null;
}

// ─── Tile configs ─────────────────────────────────────────────────────────────
const TILE_LAYERS = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#86868b">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" style="color:#86868b">CARTO</a>',
  },
  detailed: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#86868b">OpenStreetMap</a>',
  },
};

// ─── MapView ──────────────────────────────────────────────────────────────────
interface Props {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (r: Restaurant) => void;
  city: string;
}

export default function MapView({ restaurants, selected, onSelect, city }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<"light" | "detailed">("light");
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const indieCount = restaurants.filter((r) => r.indie_score >= 10).length;
  const probablyCount = restaurants.filter((r) => r.indie_score >= 5 && r.indie_score < 10).length;

  const fitAll = () => {
    if (!mapRef.current || restaurants.length === 0) return;
    const bounds = L.latLngBounds(restaurants.map((r) => [r.lat, r.lng]));
    mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  };

  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.flyTo([coords.latitude, coords.longitude], 14, { duration: 1 });
      },
      () => {/* silently ignore */}
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* ── Floating controls (top-right) ─── */}
      <div className="absolute top-3 right-12 z-[1000] flex flex-col gap-2">
        <button
          onClick={locateMe}
          title="Find my location"
          className="w-9 h-9 bg-white rounded-xl shadow-md border border-black/8 flex items-center justify-center text-zinc-500 hover:text-emerald-600 hover:shadow-lg transition-all"
        >
          <Locate size={15} />
        </button>
        <button
          onClick={fitAll}
          title="Fit all restaurants"
          className="w-9 h-9 bg-white rounded-xl shadow-md border border-black/8 flex items-center justify-center text-zinc-500 hover:text-emerald-600 hover:shadow-lg transition-all"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {/* ── Stats overlay (top-left) ─── */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-black/8 px-3 py-2 flex items-center gap-2.5 text-xs">
        <span className="font-semibold text-zinc-800">{restaurants.length}</span>
        <span className="text-zinc-400">spots</span>
        <span className="w-px h-3 bg-zinc-200" />
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="text-emerald-700 font-medium">{indieCount} indie</span>
        {probablyCount > 0 && (
          <>
            <span className="w-px h-3 bg-zinc-200" />
            <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
            <span className="text-yellow-700 font-medium">{probablyCount} likely</span>
          </>
        )}
      </div>

      <MapContainer
        center={CITY_COORDS.all.center}
        zoom={CITY_COORDS.all.zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <CaptureMap mapRef={mapRef} />
        <FlyTo restaurant={selected} city={city} />

        <TileLayer
          key="cartodb-light"
          attribution={TILE_LAYERS.light.attribution}
          url={TILE_LAYERS.light.url}
          maxZoom={19}
        />

        {restaurants.map((r) => {
          const badge = getVerdictBadge(r.indie_score);
          const isSelected = selected?.name === r.name;
          const icon = makeIcon(badge.mapColor, isSelected);

          return (
            <Marker
              key={r.name}
              position={[r.lat, r.lng]}
              icon={icon}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ click: () => onSelect(r) }}
            >
              <Popup maxWidth={240} closeButton={false} className="map-popup">
                <div className="min-w-[200px] p-3.5">
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                      style={{ background: badge.mapColor }}
                    />
                    <div>
                      <p className="font-semibold text-[13px] text-zinc-900 leading-tight">{r.name}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{r.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100">
                    <span className="text-[11px] font-medium" style={{ color: badge.mapColor }}>
                      {badge.shortLabel}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono bg-zinc-50 px-1.5 py-0.5 rounded">
                      score: {r.indie_score > 0 ? `+${r.indie_score}` : r.indie_score}
                    </span>
                  </div>
                  {r.supplier_hits.length > 0 && (
                    <p className="text-[10px] text-emerald-600 mt-1.5 leading-relaxed">
                      🧑‍🌾 {r.supplier_hits.slice(0, 2).join(", ")}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
