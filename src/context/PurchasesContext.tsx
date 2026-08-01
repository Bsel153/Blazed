import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Deal, LoggedPurchase } from '../types';

interface PurchaseRow {
  id: string;
  user_id: string;
  dispensary_id: string;
  strain_id: string;
  category: Deal['category'];
  title: string;
  price: number;
  quantity_grams: number | null;
  created_at: string;
}

function fromRow(row: PurchaseRow): LoggedPurchase {
  return {
    id: row.id,
    userId: row.user_id,
    dispensaryId: row.dispensary_id,
    strainId: row.strain_id,
    category: row.category,
    title: row.title,
    price: row.price,
    quantityGrams: row.quantity_grams,
    createdAt: row.created_at,
  };
}

interface PurchasesContextValue {
  purchases: LoggedPurchase[];
  logPurchase: (deal: Deal) => Promise<{ error: string | null }>;
}

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<LoggedPurchase[]>([]);

  const refresh = useCallback(() => {
    if (!user) {
      setPurchases([]);
      return;
    }
    supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setPurchases((data ?? []).map(fromRow)));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logPurchase = async (deal: Deal) => {
    if (!user) return { error: 'Not signed in' };
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        dispensary_id: deal.dispensaryId,
        strain_id: deal.strainId,
        category: deal.category,
        title: deal.title,
        price: deal.salePrice,
      })
      .select()
      .single();

    if (error) return { error: error.message };
    setPurchases((prev) => [fromRow(data), ...prev]);
    return { error: null };
  };

  return (
    <PurchasesContext.Provider value={{ purchases, logPurchase }}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used within a PurchasesProvider');
  return ctx;
}
