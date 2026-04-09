"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Restaurant } from "@/lib/types";
import { getVerdictBadge } from "@/lib/restaurant-utils";

// City centre coordinates for map flying
export const CITY_COORDS: Record<string, { center: [number, number]; zoom: number }> = {
  all:           { center: [56.0, -96.0],   zoom: 4  },
  Toronto:       { center: [43.6532, -79.3832], zoom: 12 },
  Hamilton:      { center: [43.2557, -79.8711], zoom: 12 },
  Cambridge:     { center: [43.3924, -80.3580], zoom: 12 },
  Ottawa:        { center: [45.4215, -75.6972], zoom: 12 },
  Vancouver:     { center: [49.2827, -123.1207], zoom: 12 },
  Calgary:       { center: [51.0447, -114.0719], zoom: 12 },
  Edmonton:      { center: [53.5461, -113.4938], zoom: 12 },
  Montreal:      { center: [45.5017, -73.5673],  zoom: 12 },
  "Quebec City": { center: [46.8139, -71.2080],  zoom: 13 },
  Winnipeg:      { center: [49.8951, -97.1384],  zoom: 12 },
  Halifax:       { center: [44.6488, -63.5752],  zoom: 13 },
  Victoria:      { center: [48.4284, -123.3656], zoom: 13 },
};

function FlyTo({
  restaurant,
  city,
}: {
  restaurant: Restaurant | null;
  city: string;
}) {
  const map = useMap();

  // Fly to selected restaurant
  useEffect(() => {
    if (restaurant) {
      map.flyTo([restaurant.lat, restaurant.lng], 15, { duration: 0.7 });
    }
  }, [restaurant, map]);

  // Fly to city when filter changes (only if no restaurant is selected)
  useEffect(() => {
    if (restaurant) return;
    const coords = CITY_COORDS[city] ?? CITY_COORDS.all;
    map.flyTo(coords.center, coords.zoom, { duration: 0.9 });
  }, [city, restaurant, map]);

  return null;
}

interface Props {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (r: Restaurant) => void;
  city: string;
}

export default function MapView({ restaurants, selected, onSelect, city }: Props) {
  return (
    <MapContainer
      center={CITY_COORDS.all.center}
      zoom={CITY_COORDS.all.zoom}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#6b7280">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyTo restaurant={selected} city={city} />

      {restaurants.map((r) => {
        const badge = getVerdictBadge(r.indie_score);
        const isSelected = selected?.name === r.name;

        return (
          <CircleMarker
            key={r.name}
            center={[r.lat, r.lng]}
            radius={isSelected ? 15 : 10}
            pathOptions={{
              fillColor: badge.mapColor,
              fillOpacity: isSelected ? 1 : 0.85,
              color: isSelected ? "#fff" : "rgba(0,0,0,0.4)",
              weight: isSelected ? 2.5 : 1.5,
            }}
            eventHandlers={{ click: () => onSelect(r) }}
          >
            <Popup maxWidth={220} closeButton={false}>
              <div className="min-w-[180px] space-y-1.5">
                <p className="font-semibold text-sm leading-tight">{r.name}</p>
                <p className="text-xs opacity-60">{r.address}</p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: badge.mapColor }}
                  />
                  <span className="text-xs font-medium" style={{ color: badge.mapColor }}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs opacity-40 font-mono">score: {r.indie_score}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
