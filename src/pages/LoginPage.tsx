import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Mode = 'signin' | 'signup' | 'forgot';

export default function LoginPage() {
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === 'forgot') {
      const result = await requestPasswordReset(email);
      if (result.error) setError(result.error);
      else setResetSent(true);
      setSubmitting(false);
      return;
    }

    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);

    if (result.error) {
      setError(result.error);
    } else if (mode === 'signup' && 'needsConfirmation' in result && result.needsConfirmation) {
      setConfirmationSent(true);
    }
    setSubmitting(false);
  };

  const backToSignIn = () => {
    setConfirmationSent(false);
    setResetSent(false);
    setError(null);
    setMode('signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-3xl">🌿</span>
          <span className="text-2xl font-bold text-green-700 dark:text-green-400">Blazed</span>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          {confirmationSent ? (
            <div className="text-center">
              <p className="text-neutral-700 dark:text-neutral-200 font-medium mb-1">Check your email</p>
              <p className="text-sm text-neutral-500">
                We sent a confirmation link to {email}. Confirm it, then sign in below.
              </p>
              <button
                type="button"
                onClick={backToSignIn}
                className="mt-4 text-sm text-green-700 dark:text-green-400 hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : resetSent ? (
            <div className="text-center">
              <p className="text-neutral-700 dark:text-neutral-200 font-medium mb-1">Check your email</p>
              <p className="text-sm text-neutral-500">
                We sent a password reset link to {email}. Follow it to choose a new password.
              </p>
              <button
                type="button"
                onClick={backToSignIn}
                className="mt-4 text-sm text-green-700 dark:text-green-400 hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              {mode !== 'forgot' && (
                <div className="flex mb-5 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                      mode === 'signin' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm' : 'text-neutral-500'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                      mode === 'signup' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm' : 'text-neutral-500'
                    }`}
                  >
                    Sign up
                  </button>
                </div>
              )}

              {mode === 'forgot' && (
                <p className="text-sm text-neutral-500 mb-4">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                  />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('forgot');
                    }}
                    className="self-end text-xs text-green-700 dark:text-green-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg"
                >
                  {submitting
                    ? 'Please wait…'
                    : mode === 'signin'
                      ? 'Sign in'
                      : mode === 'signup'
                        ? 'Create account'
                        : 'Send reset link'}
                </button>

                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={backToSignIn}
                    className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  >
                    Back to sign in
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
