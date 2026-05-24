export type PropertyCondition = 'excellent' | 'good' | 'average' | 'fair' | 'poor';
export type PropertyStyle = 'single_family' | 'condo' | 'townhouse' | 'multi_family';
export type SaleStatus = 'sold' | 'active' | 'pending';

export interface SubjectProperty {
  id?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  lot_sqft?: number;
  year_built?: number;
  condition: PropertyCondition;
  style: PropertyStyle;
  garage?: number;
  pool?: boolean;
  notes?: string;
}

export interface Comparable {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  lot_sqft?: number;
  year_built?: number;
  sale_price: number;
  list_price?: number;
  sale_date: string;
  days_on_market: number;
  status: SaleStatus;
  style?: PropertyStyle;
  garage?: number;
  pool?: boolean;
  distance_miles?: number;
  price_per_sqft: number;
  // Manual adjustments
  adjustment?: number;
  adjustment_notes?: string;
  included: boolean;
  source: 'zillow' | 'manual';
  zpid?: string;
}

export interface MarketStats {
  avg_sale_price: number;
  median_sale_price: number;
  avg_price_per_sqft: number;
  avg_days_on_market: number;
  avg_list_to_sale_ratio: number;
  absorption_rate?: number;
  active_listings?: number;
  sold_last_30?: number;
  price_trend?: number;
}

export interface CMAReport {
  id?: string;
  agent_id: string;
  created_at?: string;
  updated_at?: string;
  subject: SubjectProperty;
  comps: Comparable[];
  market_stats: MarketStats;
  suggested_low: number;
  suggested_high: number;
  suggested_price: number;
  agent_notes?: string;
  client_name?: string;
  client_email?: string;
}

export interface Agent {
  id: string;
  email: string;
  full_name: string;
  brokerage?: string;
  license_number?: string;
  phone?: string;
  avatar_url?: string;
  rapidapi_key?: string;
}
