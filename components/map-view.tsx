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

function FlyTo({ restaurant }: { restaurant: Restaurant | null }) {
  const map = useMap();
  useEffect(() => {
    if (restaurant) {
      map.flyTo([restaurant.lat, restaurant.lng], 15, { duration: 0.7 });
    }
  }, [restaurant, map]);
  return null;
}

interface Props {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (r: Restaurant) => void;
}

export default function MapView({ restaurants, selected, onSelect }: Props) {
  return (
    <MapContainer
      center={[43.6532, -79.3832]}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#6b7280">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles-dark"
      />

      <FlyTo restaurant={selected} />

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
