import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dispensaries, specialtyDeals } from '../data/mockData';
import { useLocation } from '../context/LocationContext';
import { usePurchases } from '../context/PurchasesContext';
import ScanPurchaseButton from '../components/ScanPurchaseButton';

export default function RewardsPage() {
  const { stateCode } = useLocation();
  const { purchases } = usePurchases();

  const pointsByDispensary = useMemo(() => {
    const map = new Map<string, number>();
    purchases.forEach((p) => {
      map.set(p.dispensaryId, (map.get(p.dispensaryId) ?? 0) + Math.round(p.price));
    });
    return map;
  }, [purchases]);

  const visitedDispensaryIds = useMemo(() => new Set(purchases.map((p) => p.dispensaryId)), [purchases]);

  const visited = useMemo(
    () =>
      dispensaries
        .filter((d) => visitedDispensaryIds.has(d.id))
        .map((d) => ({
          dispensary: d,
          points: pointsByDispensary.get(d.id) ?? 0,
          rewards: specialtyDeals
            .filter((r) => r.dispensaryId === d.id)
            .sort((a, b) => a.pointsRequired - b.pointsRequired),
        }))
        .sort((a, b) => b.points - a.points),
    [visitedDispensaryIds, pointsByDispensary],
  );

  const totalPoints = visited.reduce((sum, v) => sum + v.points, 0);
  const totalUnlocked = visited.reduce(
    (sum, v) => sum + v.rewards.filter((r) => r.pointsRequired <= v.points).length,
    0,
  );

  const discover = useMemo(
    () =>
      dispensaries
        .filter((d) => !visitedDispensaryIds.has(d.id) && (!stateCode || d.state === stateCode))
        .slice(0, 6)
        .map((d) => ({
          dispensary: d,
          topReward: specialtyDeals
            .filter((r) => r.dispensaryId === d.id)
            .sort((a, b) => a.pointsRequired - b.pointsRequired)[0],
        }))
        .filter((d) => d.topReward),
    [visitedDispensaryIds, stateCode],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Rewards</h1>
        <ScanPurchaseButton />
      </div>
      <p className="text-neutral-500 mb-6">Loyalty points and specialty deals, synced per dispensary</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Total points</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{totalPoints}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Rewards unlocked</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{totalUnlocked}</p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">Your dispensaries</h2>
        {visited.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No purchases logged yet — scan a QR code from your receipt or the product's packaging to start earning points.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {visited.map(({ dispensary, points, rewards }) => {
              const nextReward = rewards.find((r) => r.pointsRequired > points);
              const progressPct = nextReward
                ? Math.min(100, Math.round((points / nextReward.pointsRequired) * 100))
                : 100;

              return (
                <div
                  key={dispensary.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Link to={`/dispensary/${dispensary.id}`} className="flex items-center gap-2 hover:underline">
                      <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: dispensary.color }} />
                      <div>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{dispensary.name}</span>
                        <span className="block text-xs text-neutral-500">{dispensary.city}, {dispensary.state}</span>
                      </div>
                    </Link>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">{points} pts</span>
                  </div>

                  <div className="mb-4">
                    <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {nextReward
                        ? `${nextReward.pointsRequired - points} pts to "${nextReward.title}"`
                        : 'All rewards unlocked at this dispensary'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {rewards.map((reward) => {
                      const unlocked = reward.pointsRequired <= points;
                      return (
                        <span
                          key={reward.id}
                          title={reward.description}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                            unlocked
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}
                        >
                          {unlocked ? '✓' : '🔒'} {reward.title} · {reward.pointsRequired}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
          Discover{stateCode ? ` in ${stateCode}` : ''}
        </h2>
        {discover.length === 0 ? (
          <p className="text-sm text-neutral-500">No new dispensaries to discover right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {discover.map(({ dispensary, topReward }) => (
              <Link
                key={dispensary.id}
                to={`/dispensary/${dispensary.id}`}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: dispensary.color }} />
                  <div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">{dispensary.name}</span>
                    <span className="block text-xs text-neutral-500">{dispensary.city}, {dispensary.state}</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500">
                  Earn {topReward.pointsRequired} pts here for <span className="font-medium">{topReward.title}</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
