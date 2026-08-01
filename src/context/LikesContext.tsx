import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface LikesContextValue {
  likedStrainIds: string[];
  isLiked: (strainId: string) => boolean;
  toggleLike: (strainId: string) => void;
}

const LikesContext = createContext<LikesContextValue | null>(null);

export function LikesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [likedStrainIds, setLikedStrainIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setLikedStrainIds([]);
      return;
    }
    supabase
      .from('likes')
      .select('strain_id')
      .then(({ data }) => setLikedStrainIds((data ?? []).map((row) => row.strain_id)));
  }, [user]);

  const toggleLike = (strainId: string) => {
    if (!user) return;
    const wasLiked = likedStrainIds.includes(strainId);

    setLikedStrainIds((prev) => (wasLiked ? prev.filter((id) => id !== strainId) : [...prev, strainId]));

    if (wasLiked) {
      supabase.from('likes').delete().eq('user_id', user.id).eq('strain_id', strainId).then();
    } else {
      supabase.from('likes').insert({ user_id: user.id, strain_id: strainId }).then();
    }
  };

  return (
    <LikesContext.Provider
      value={{ likedStrainIds, isLiked: (id) => likedStrainIds.includes(id), toggleLike }}
    >
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const ctx = useContext(LikesContext);
  if (!ctx) throw new Error('useLikes must be used within a LikesProvider');
  return ctx;
}
