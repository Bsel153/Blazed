import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await updatePassword(password);
    if (error) setError(error);
    else setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-3xl">🌿</span>
          <span className="text-2xl font-bold text-green-700 dark:text-green-400">Blazed</span>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          {done ? (
            <div className="text-center">
              <p className="text-neutral-700 dark:text-neutral-200 font-medium mb-1">Password updated</p>
              <p className="text-sm text-neutral-500">You're signed in with your new password.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-500 mb-4">Choose a new password for your account.</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                  />
                </div>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg"
                >
                  {submitting ? 'Please wait…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
