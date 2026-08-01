import { useEffect, useMemo, useState } from 'react';
import { deals, dispensaries } from '../data/mockData';
import DealCard from '../components/DealCard';
import LocationBar from '../components/LocationBar';
import { useLocation } from '../context/LocationContext';
import type { Deal, ProgramType } from '../types';

const categories: (Deal['category'] | 'all')[] = [
  'all', 'flower', 'edible', 'vape', 'concentrate', 'preroll', 'tincture', 'topical',
];

const copy: Record<ProgramType, { heading: string; subtitle: string }> = {
  recreational: {
    heading: 'Recreational Deals',
    subtitle: 'Open to anyone 21+ — no medical card required.',
  },
  medical: {
    heading: 'Medical Deals',
    subtitle: 'Shop with your medical card at every licensed dispensary — medical-only shops and recreational stores alike.',
  },
};

export default function DealsPage({ programType }: { programType: ProgramType }) {
  const [category, setCategory] = useState<Deal['category'] | 'all'>('all');
  const [dispensaryId, setDispensaryId] = useState<string>('all');
  const { stateCode } = useLocation();

  // Recreational stores only serve adults without a card, so the rec tab stays
  // limited to them. Medical-card holders can shop anywhere licensed, so the
  // medical tab includes every dispensary — not just the medical-only ones.
  const programDispensaries = useMemo(
    () => (programType === 'medical' ? dispensaries : dispensaries.filter((d) => d.programType === 'recreational')),
    [programType],
  );

  const availableStates = useMemo(
    () => new Set(programDispensaries.map((d) => d.state)),
    [programDispensaries],
  );
  const activeState = stateCode && availableStates.has(stateCode) ? stateCode : null;

  const dispensariesInState = useMemo(() => {
    const list = activeState ? programDispensaries.filter((d) => d.state === activeState) : programDispensaries;
    return [...list].sort(
      (a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city) || a.name.localeCompare(b.name),
    );
  }, [programDispensaries, activeState]);

  // Reset dispensary filter if it falls outside the current program/state selection.
  useEffect(() => {
    if (dispensaryId !== 'all' && !dispensariesInState.some((d) => d.id === dispensaryId)) {
      setDispensaryId('all');
    }
  }, [dispensariesInState, dispensaryId]);

  const programDispensaryIds = useMemo(() => new Set(programDispensaries.map((d) => d.id)), [programDispensaries]);

  const filtered = useMemo(() => {
    return deals
      .filter((d) => {
        const dispensary = dispensaries.find((disp) => disp.id === d.dispensaryId)!;
        return (
          programDispensaryIds.has(d.dispensaryId) &&
          (category === 'all' || d.category === category) &&
          (dispensaryId === 'all' || d.dispensaryId === dispensaryId) &&
          (!activeState || dispensary.state === activeState)
        );
      })
      .sort((a, b) => {
        const dispA = dispensaries.find((disp) => disp.id === a.dispensaryId)!;
        const dispB = dispensaries.find((disp) => disp.id === b.dispensaryId)!;
        return (
          dispA.state.localeCompare(dispB.state) ||
          dispA.city.localeCompare(dispB.city) ||
          dispA.name.localeCompare(dispB.name) ||
          a.category.localeCompare(b.category)
        );
      });
  }, [programDispensaryIds, category, dispensaryId, activeState]);

  const { heading, subtitle } = copy[programType];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">{heading}</h1>
      <p className="text-neutral-500 mb-1">{subtitle}</p>
      <p className="text-neutral-500 mb-4">{filtered.length} active deals across {dispensariesInState.length} dispensaries</p>

      <LocationBar dispensaries={programDispensaries} />

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Deal['category'] | 'all')}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
          ))}
        </select>
        <select
          value={dispensaryId}
          onChange={(e) => setDispensaryId(e.target.value)}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
        >
          <option value="all">All dispensaries{activeState ? ` in ${activeState}` : ''}</option>
          {dispensariesInState.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-500">No deals match those filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((deal) => (
            <DealCard key={deal.id} deal={deal} showProgramBadge={programType === 'medical'} enableQr={false} />
          ))}
        </div>
      )}
    </div>
  );
}
