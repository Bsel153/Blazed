import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { reviews, currentUser, getStrain, getDispensary, getUser } from '../data/mockData';
import StrainTypeBadge from '../components/StrainTypeBadge';
import LikeButton from '../components/LikeButton';
import ShareButton from '../components/ShareButton';
import { useLikes } from '../context/LikesContext';
import { usePurchases } from '../context/PurchasesContext';
import ScanPurchaseButton from '../components/ScanPurchaseButton';

const GREEN = '#16a34a';

export default function DashboardPage() {
  const { likedStrainIds } = useLikes();
  const likedStrains = useMemo(() => likedStrainIds.map(getStrain), [likedStrainIds]);
  const { purchases: myPurchases } = usePurchases();

  const myReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.userId === currentUser.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [],
  );

  const topStrains = useMemo(() => {
    const counts = new Map<string, { count: number; grams: number }>();
    myPurchases.forEach((p) => {
      const entry = counts.get(p.strainId) ?? { count: 0, grams: 0 };
      entry.count += 1;
      entry.grams += p.quantityGrams ?? 0;
      counts.set(p.strainId, entry);
    });
    return [...counts.entries()]
      .map(([strainId, { count, grams }]) => ({ strain: getStrain(strainId), count, grams }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [myPurchases]);

  const chartData = topStrains.map((t) => ({ name: t.strain.name, purchases: t.count }));

  const monthlyUsage = useMemo(() => {
    const months = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.set(d.toLocaleDateString('en-US', { month: 'short' }), 0);
    }
    myPurchases.forEach((p) => {
      const d = new Date(p.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      if (months.has(key)) months.set(key, (months.get(key) ?? 0) + 1);
    });
    return [...months.entries()].map(([month, count]) => ({ month, count }));
  }, [myPurchases]);

  const totalSpend = myPurchases.reduce((sum, p) => sum + p.price, 0);
  const totalGrams = myPurchases.reduce((sum, p) => sum + (p.quantityGrams ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Stats</h1>
        <ScanPurchaseButton />
      </div>
      <p className="text-neutral-500 mb-6">
        {myPurchases.length === 0
          ? "No purchases logged yet — scan a deal's QR code to get started."
          : "Built from purchases you've scanned and logged"}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatTile label="Purchases" value={myPurchases.length.toString()} />
        <StatTile label="Total spend" value={`$${totalSpend}`} />
        <StatTile label="Grams (approx)" value={totalGrams.toFixed(1)} />
        <StatTile label="Reviews written" value={myReviews.length.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">Most bought strains</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-neutral-500">No purchases yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="var(--chart-grid, #e5e5e5)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(22,163,74,0.08)' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                />
                <Bar dataKey="purchases" fill={GREEN} radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">Purchases per month</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyUsage} margin={{ left: -16, right: 16 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid, #e5e5e5)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke={GREEN} strokeWidth={2} dot={{ r: 4, fill: GREEN }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">Top strains detail</h2>
        <div className="flex flex-col gap-2">
          {topStrains.map(({ strain, count, grams }) => (
            <Link
              key={strain.id}
              to={`/strain/${strain.id}`}
              className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{strain.name}</span>
                <StrainTypeBadge type={strain.type} />
              </div>
              <span className="text-sm text-neutral-500">{count} purchases · {grams.toFixed(1)}g</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Liked strains</h2>
          {likedStrains.length > 0 && (
            <ShareButton
              title="My liked strains on Blazed"
              text={`Check out the strains I like on Blazed 🌿: ${likedStrains.map((s) => s.name).join(', ')}`}
              url={window.location.origin}
              label="Share my likes"
            />
          )}
        </div>
        {likedStrains.length === 0 ? (
          <p className="text-sm text-neutral-500">Tap the heart on any strain page to save it here.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {likedStrains.map((strain) => (
              <div
                key={strain.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 px-4 py-2"
              >
                <Link to={`/strain/${strain.id}`} className="flex items-center gap-2 hover:underline">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{strain.name}</span>
                  <StrainTypeBadge type={strain.type} />
                </Link>
                <div className="flex items-center gap-3">
                  <ShareButton
                    title={strain.name}
                    text={`Check out ${strain.name} on Blazed 🌿`}
                    url={`${window.location.origin}/strain/${strain.id}`}
                  />
                  <LikeButton strainId={strain.id} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">My reviews</h2>
        {myReviews.length === 0 ? (
          <p className="text-sm text-neutral-500">You haven't written any reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {myReviews.map((review) => {
              const strain = getStrain(review.strainId);
              const dispensary = getDispensary(review.dispensaryId);
              return (
                <div key={review.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <Link to={`/strain/${strain.id}`} className="text-sm font-medium text-green-700 dark:text-green-400 hover:underline">
                      {strain.name}
                    </Link>
                    <span className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{review.text}</p>
                  <p className="text-xs text-neutral-400 mt-1">{dispensary.name} · {getUser(review.userId).name}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-900">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
    </div>
  );
}
