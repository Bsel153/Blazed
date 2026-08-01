import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'blazed:likedStrainIds';

function loadLiked(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

interface LikesContextValue {
  likedStrainIds: string[];
  isLiked: (strainId: string) => boolean;
  toggleLike: (strainId: string) => void;
}

const LikesContext = createContext<LikesContextValue | null>(null);

export function LikesProvider({ children }: { children: ReactNode }) {
  const [likedStrainIds, setLikedStrainIds] = useState<string[]>(loadLiked);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likedStrainIds));
  }, [likedStrainIds]);

  const toggleLike = (strainId: string) => {
    setLikedStrainIds((prev) =>
      prev.includes(strainId) ? prev.filter((id) => id !== strainId) : [...prev, strainId],
    );
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
