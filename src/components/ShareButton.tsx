import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  label?: string;
  className?: string;
}

export default function ShareButton({ title, text, url, label = 'Share', className = '' }: ShareButtonProps) {
  const [feedback, setFeedback] = useState<'copied' | 'error' | null>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled the native share sheet — not an error
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setFeedback('copied');
    } catch {
      setFeedback('error');
    }
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${className}`}
    >
      {feedback === 'copied' ? 'Link copied!' : feedback === 'error' ? "Couldn't copy" : `🔗 ${label}`}
    </button>
  );
}
