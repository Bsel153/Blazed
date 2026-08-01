import type { Strain } from '../types';

function similarityScore(liked: Strain, candidate: Strain): number {
  const sameType = liked.type === candidate.type ? 3 : 0;
  const sharedEffects = liked.effects.filter((e) => candidate.effects.includes(e)).length;
  const potencyGap = Math.abs(liked.thc - candidate.thc) / 10;
  return sameType + sharedEffects - potencyGap;
}

// Ranks candidate strains by similarity to the user's liked strains, excluding strains already liked.
export function recommendStrains(likedStrains: Strain[], candidates: Strain[], limit = 4): Strain[] {
  if (likedStrains.length === 0) return [];
  const likedIds = new Set(likedStrains.map((s) => s.id));
  const pool = candidates.filter((c) => !likedIds.has(c.id));

  return pool
    .map((candidate) => ({
      candidate,
      score: Math.max(...likedStrains.map((liked) => similarityScore(liked, candidate))),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.candidate);
}
