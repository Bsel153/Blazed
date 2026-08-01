import { NavLink } from 'react-router-dom';
import { currentUser } from '../data/mockData';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-green-600 text-white'
      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
  }`;

export default function NavBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="text-xl font-bold text-green-700 dark:text-green-400">Blazed</span>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/recreational" className={linkClass}>Recreational</NavLink>
          <NavLink to="/medical" className={linkClass}>Medical</NavLink>
          <NavLink to="/dashboard" className={linkClass}>My Stats</NavLink>
          <NavLink to="/rewards" className={linkClass}>Rewards</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: currentUser.avatarColor }}
          >
            {currentUser.name[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
