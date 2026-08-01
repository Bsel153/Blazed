export type StrainType = 'indica' | 'sativa' | 'hybrid';

export type ProgramType = 'recreational' | 'medical';

export interface Dispensary {
  id: string;
  name: string;
  city: string;
  state: string;
  color: string;
  programType: ProgramType;
  website?: string;
}

export interface Strain {
  id: string;
  name: string;
  type: StrainType;
  thc: number;
  cbd: number;
  description: string;
  effects: string[];
}

export interface Deal {
  id: string;
  dispensaryId: string;
  strainId: string;
  title: string;
  category: 'flower' | 'edible' | 'vape' | 'concentrate' | 'preroll' | 'tincture' | 'topical';
  originalPrice: number;
  salePrice: number;
  expiresAt: string;
}

export interface Review {
  id: string;
  userId: string;
  strainId: string;
  dispensaryId: string;
  rating: number;
  text: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  avatarColor: string;
}

// A real purchase logged by scanning a deal's QR code, stored per-user in Supabase.
export interface LoggedPurchase {
  id: string;
  userId: string;
  dispensaryId: string;
  strainId: string;
  category: Deal['category'];
  title: string;
  price: number;
  quantityGrams: number | null;
  createdAt: string;
}

export interface SpecialtyDeal {
  id: string;
  dispensaryId: string;
  title: string;
  description: string;
  pointsRequired: number;
  expiresAt: string;
}
