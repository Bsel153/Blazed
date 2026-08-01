import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { strains, reviews as allReviews, getUser, getDispensary, currentUser, deals } from '../data/mockData';
import type { Review } from '../types';
import StrainTypeBadge from './../components/StrainTypeBadge';
import DealCard from '../components/DealCard';
import LikeButton from '../components/LikeButton';
import ShareButton from '../components/ShareButton';

export default function StrainDetailPage() {
  const { id } = useParams<{ id: string }>();
  const strain = strains.find((s) => s.id === id);

  const [extraReviews, setExtraReviews] = useState<Review[]>([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);

  const strainDeals = useMemo(() => deals.filter((d) => d.strainId === id), [id]);
  const strainReviews = useMemo(
    () =>
      [...allReviews.filter((r) => r.strainId === id), ...extraReviews].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [id, extraReviews],
  );
  const avgRating = strainReviews.length
    ? (strainReviews.reduce((sum, r) => sum + r.rating, 0) / strainReviews.length).toFixed(1)
    : '—';

  if (!strain) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-neutral-500">Strain not found.</p>
        <Link to="/" className="text-green-700 dark:text-green-400 underline">Back to deals</Link>
      </div>
    );
  }

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setExtraReviews((prev) => [
      {
        id: `local-${Date.now()}`,
        userId: currentUser.id,
        strainId: strain.id,
        dispensaryId: strainDeals[0]?.dispensaryId ?? 'd1',
        rating,
        text: text.trim(),
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
    setText('');
    setRating(5);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/" className="text-sm text-green-700 dark:text-green-400 hover:underline">&larr; Back to deals</Link>

      <div className="mt-4 mb-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{strain.name}</h1>
            <StrainTypeBadge type={strain.type} />
            <LikeButton strainId={strain.id} />
          </div>
          <ShareButton
            title={strain.name}
            text={`Check out ${strain.name} on Blazed 🌿 — THC ${strain.thc}%, ${strain.type}`}
            url={`${window.location.origin}/strain/${strain.id}`}
          />
        </div>
        <p className="text-neutral-600 dark:text-neutral-300">{strain.description}</p>
        <div className="flex gap-4 mt-3 text-sm text-neutral-500">
          <span>THC {strain.thc}%</span>
          <span>CBD {strain.cbd}%</span>
          <span>⭐ {avgRating} ({strainReviews.length} reviews)</span>
        </div>
        <div className="flex gap-2 mt-3">
          {strain.effects.map((effect) => (
            <span key={effect} className="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              {effect}
            </span>
          ))}
        </div>
      </div>

      {strainDeals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Current deals on {strain.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {strainDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Reviews</h2>

        <form onSubmit={submitReview} className="mb-6 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Your rating:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                className={`text-lg ${n <= rating ? 'text-yellow-500' : 'text-neutral-300 dark:text-neutral-700'}`}
                aria-label={`${n} star`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience with this strain..."
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm resize-none"
            rows={2}
          />
          <button
            type="submit"
            className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Post review
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {strainReviews.map((review) => {
            const reviewer = getUser(review.userId);
            const dispensary = getDispensary(review.dispensaryId);
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
                    <span className="text-xs text-neutral-400">· {dispensary.name}</span>
                  </div>
                  <span className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{review.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
