import { Link } from 'react-router-dom';
import type { Deal } from '../types';
import { getDispensary, getStrain } from '../data/mockData';
import StrainTypeBadge from './StrainTypeBadge';
import ShareButton from './ShareButton';

export default function DealCard({ deal, showProgramBadge = true }: { deal: Deal; showProgramBadge?: boolean }) {
  const dispensary = getDispensary(deal.dispensaryId);
  const strain = getStrain(deal.strainId);
  const discountPct = Math.round((1 - deal.salePrice / deal.originalPrice) * 100);
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(deal.expiresAt).getTime() - Date.now()) / 86_400_000),
  );
  const shareUrl = `${window.location.origin}/strain/${strain.id}`;

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-3 bg-white dark:bg-neutral-900 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full shrink-0"
            style={{ backgroundColor: dispensary.color }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <Link
                to={`/dispensary/${dispensary.id}`}
                className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:underline"
              >
                {dispensary.name}
              </Link>
              {showProgramBadge && dispensary.programType === 'medical' && (
                <span className="text-[10px] font-semibold uppercase tracking-wide bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 px-1.5 py-0.5 rounded">
                  Medical
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">{dispensary.city}, {dispensary.state}</p>
            {dispensary.website && (
              <a
                href={dispensary.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-green-700 dark:text-green-400 hover:underline"
              >
                Visit website ↗
              </a>
            )}
          </div>
        </div>
        <span className="text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 rounded-full">
          -{discountPct}%
        </span>
      </div>

      <div>
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{deal.title}</p>
        <p className="text-xs text-neutral-500 capitalize">{deal.category}</p>
      </div>

      <Link to={`/strain/${strain.id}`} className="flex items-center gap-2 group">
        <span className="text-sm font-medium text-green-700 dark:text-green-400 group-hover:underline">
          {strain.name}
        </span>
        <StrainTypeBadge type={strain.type} />
      </Link>

      <div className="flex items-end justify-between mt-auto pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">${deal.salePrice}</span>
          <span className="text-sm text-neutral-400 line-through ml-2">${deal.originalPrice}</span>
        </div>
        <span className="text-xs text-neutral-500">{daysLeft === 0 ? 'Ends today' : `${daysLeft}d left`}</span>
      </div>

      <ShareButton
        title={`${deal.title} at ${dispensary.name}`}
        text={`Check out this deal on ${strain.name} at ${dispensary.name}: ${deal.title} — $${deal.salePrice} (was $${deal.originalPrice}) on Blazed 🌿`}
        url={shareUrl}
        label="Share deal"
        className="self-start"
      />
    </div>
  );
}
