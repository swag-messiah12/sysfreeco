export interface Restaurant {
  id?: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  rating: number | null;
  website: string | null;
  phone: string | null;
  price_level: number | null;
  indie_score: number;
  positive_hits: string[];
  negative_hits: string[];
  supplier_hits: string[];
  data_sources: string[];
  verdict: string;
  verified?: boolean;
  created_at?: string;
}

export interface Submission {
  name: string;
  address: string;
  city: string;
  website?: string;
  phone?: string;
  notes?: string;
  email?: string;
}

export type CityFilter =
  | "all"
  | "Toronto"
  | "Hamilton"
  | "Cambridge"
  | "Ottawa"
  | "Vancouver"
  | "Calgary"
  | "Edmonton"
  | "Montreal"
  | "Quebec City"
  | "Winnipeg"
  | "Halifax"
  | "Victoria";

export type VerdictFilter =
  | "all"
  | "independent"   // score >= 5
  | "signals"       // 1–4
  | "nodata"        // 0
  | "sysco";        // <= -3

export interface FilterState {
  city: CityFilter;
  verdict: VerdictFilter;
  search: string;
}
