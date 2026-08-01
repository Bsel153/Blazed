import { useLikes } from '../context/LikesContext';

export default function LikeButton({ strainId, size = 'md' }: { strainId: string; size?: 'sm' | 'md' }) {
  const { isLiked, toggleLike } = useLikes();
  const liked = isLiked(strainId);
  const textSize = size === 'sm' ? 'text-base' : 'text-xl';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(strainId);
      }}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike strain' : 'Like strain'}
      className={`${textSize} leading-none transition-transform active:scale-90 ${
        liked ? 'text-red-500' : 'text-neutral-300 dark:text-neutral-600 hover:text-red-400'
      }`}
    >
      {liked ? '♥' : '♡'}
    </button>
  );
}
