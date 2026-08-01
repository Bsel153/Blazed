import type { StrainType } from '../types';

const styles: Record<StrainType, string> = {
  indica: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  sativa: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  hybrid: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
};

export default function StrainTypeBadge({ type }: { type: StrainType }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[type]}`}>
      {type}
    </span>
  );
}
