import { Link } from 'react-router-dom';
import type { Strain } from '../types';
import { recommendStrains } from '../lib/recommend';
import StrainTypeBadge from './StrainTypeBadge';
import LikeButton from './LikeButton';

interface RecommendedStrainsProps {
  dispensaryName: string;
  likedStrains: Strain[];
  availableStrains: Strain[];
  hasVisited: boolean;
}

export default function RecommendedStrains({
  dispensaryName,
  likedStrains,
  availableStrains,
  hasVisited,
}: RecommendedStrainsProps) {
  const missingLiked = likedStrains.filter((s) => !availableStrains.some((a) => a.id === s.id));
  const recommended = recommendStrains(likedStrains, availableStrains, 4);

  if (recommended.length === 0) return null;
  if (missingLiked.length === 0 && hasVisited) return null;

  const heading =
    missingLiked.length > 0
      ? `${dispensaryName} doesn't carry ${missingLiked.map((s) => s.name).join(', ')} — you might like these instead`
      : `New here? Based on what you like, try these at ${dispensaryName}`;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">{heading}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommended.map((strain) => (
          <div
            key={strain.id}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between mb-1">
              <Link to={`/strain/${strain.id}`} className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline">
                {strain.name}
              </Link>
              <LikeButton strainId={strain.id} size="sm" />
            </div>
            <StrainTypeBadge type={strain.type} />
            <p className="text-xs text-neutral-500 mt-2">THC {strain.thc}% · CBD {strain.cbd}%</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {strain.effects.map((effect) => (
                <span
                  key={effect}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
