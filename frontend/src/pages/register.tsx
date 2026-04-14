import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/api';
import Layout from '../components/Layout';

export default function Register() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(null); setLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      router.push('/login?registered=1');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed. This email may already be in use.');
    } finally { setLoading(false); }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['transparent', 'var(--apple-red)', '#ff9f0a', 'var(--apple-green)'];
  const strengthLabels = ['', 'Too short', 'Fair', 'Strong'];

  return (
    <Layout>
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                 style={{ background: 'var(--apple-blue)' }}>F</div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--apple-dark)', fontSize: '1.75rem' }}>Create account</h1>
            <p className="text-sm" style={{ color: 'var(--apple-mid)' }}>Join FindSpace — it's free forever</p>
          </div>

          <div className="card p-7">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--apple-red)' }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input id="email" type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input id="password" type="password" className="input" placeholder="At least 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--apple-border)' }}>
                      <div className="h-full rounded-full transition-all duration-300"
                           style={{ width: `${(strength / 3) * 100}%`, background: strengthColors[strength] }} />
                    </div>
                    <span className="text-xs" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="confirm" className="label">Confirm password</label>
                <input id="confirm" type="password" className="input" placeholder="Repeat your password"
                  value={confirmPassword} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
              </div>
              <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--apple-mid)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--apple-blue)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
