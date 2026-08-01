import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dispensaries, deals, reviews, getStrain, getUser } from '../data/mockData';
import DealCard from '../components/DealCard';

export default function DispensaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispensary = dispensaries.find((d) => d.id === id);

  const dispensaryDeals = useMemo(() => deals.filter((d) => d.dispensaryId === id), [id]);
  const dispensaryReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.dispensaryId === id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [id],
  );

  if (!dispensary) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-neutral-500">Dispensary not found.</p>
        <Link to="/recreational" className="text-green-700 dark:text-green-400 underline">Back to deals</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link
        to={dispensary.programType === 'medical' ? '/medical' : '/recreational'}
        className="text-sm text-green-700 dark:text-green-400 hover:underline"
      >
        &larr; Back to deals
      </Link>

      <div className="mt-4 mb-8 flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-full shrink-0"
          style={{ backgroundColor: dispensary.color }}
        />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{dispensary.name}</h1>
            {dispensary.programType === 'medical' && (
              <span className="text-[10px] font-semibold uppercase tracking-wide bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 px-1.5 py-0.5 rounded">
                Medical
              </span>
            )}
          </div>
          <p className="text-neutral-500">{dispensary.city}, {dispensary.state}</p>
          {dispensary.website ? (
            <a
              href={dispensary.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-700 dark:text-green-400 hover:underline"
            >
              Visit official website ↗
            </a>
          ) : (
            <p className="text-sm text-neutral-400">No verified website on file.</p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
          Current deals ({dispensaryDeals.length})
        </h2>
        {dispensaryDeals.length === 0 ? (
          <p className="text-neutral-500 text-sm">No active deals from this dispensary right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dispensaryDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
          Reviews mentioning this dispensary ({dispensaryReviews.length})
        </h2>
        {dispensaryReviews.length === 0 ? (
          <p className="text-neutral-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {dispensaryReviews.map((review) => {
              const strain = getStrain(review.strainId);
              const reviewer = getUser(review.userId);
              return (
                <div key={review.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: reviewer.avatarColor }}
                      >
                        {reviewer.name[0]}
                      </div>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{reviewer.name}</span>
                      <span className="text-xs text-neutral-400">
                        · on{' '}
                        <Link to={`/strain/${strain.id}`} className="text-green-700 dark:text-green-400 hover:underline">
                          {strain.name}
                        </Link>
                      </span>
                    </div>
                    <span className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{review.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
