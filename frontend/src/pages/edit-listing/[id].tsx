import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../lib/api';
import Layout from '../../components/Layout';

export default function EditListingPage() {
  const router      = useRouter();
  const { id }      = router.query;
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent]             = useState('');
  const [address, setAddress]       = useState('');
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login'); return;
    }
    api.get(`/listings/${id}`)
      .then(r => {
        setTitle(r.data.title || '');
        setDescription(r.data.description || '');
        setRent(String(r.data.rent || ''));
        setAddress(r.data.address || '');
        setLoading(false);
      })
      .catch(() => { setError('Could not load listing.'); setLoading(false); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      await api.put(`/listings/${id}`, { title, description, rent: parseFloat(rent), address });
      router.push('/profile?tab=listings');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save changes.');
      setSaving(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="page-container py-16 text-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
             style={{ borderColor: 'var(--apple-border)', borderTopColor: 'var(--apple-blue)' }} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="page-container py-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm mb-4"
                  style={{ color: 'var(--apple-mid)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Profile
            </Link>
            <h1 style={{ color: 'var(--apple-dark)', fontSize: '1.75rem' }}>Edit Listing</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--apple-mid)' }}>
              Update your listing details. Saving will reactivate it if it was deactivated.
            </p>
          </div>

          <div className="card p-7">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm"
                   style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--apple-red)' }}>
                ⚠ {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="title" className="label">Title <span style={{ color: 'var(--apple-red)' }}>*</span></label>
                <input id="title" className="input" value={title}
                  onChange={e => setTitle(e.target.value)} required maxLength={120} />
                <p className="text-xs mt-1 text-right" style={{ color: 'var(--apple-mid)' }}>{title.length}/120</p>
              </div>
              <div>
                <label htmlFor="rent" className="label">Monthly Rent (USD) <span style={{ color: 'var(--apple-red)' }}>*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-medium"
                        style={{ color: 'var(--apple-mid)' }}>$</span>
                  <input id="rent" type="number" step="1" min="1" className="input pl-7"
                    value={rent} onChange={e => setRent(e.target.value)} required />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm"
                        style={{ color: 'var(--apple-mid)' }}>/mo</span>
                </div>
              </div>
              <div>
                <label htmlFor="address" className="label">Address</label>
                <input id="address" className="input" value={address}
                  onChange={e => setAddress(e.target.value)} />
              </div>
              <div>
                <label htmlFor="description" className="label">Description <span style={{ color: 'var(--apple-red)' }}>*</span></label>
                <textarea id="description" className="input" rows={6} value={description}
                  onChange={e => setDescription(e.target.value)} required maxLength={2000} />
                <p className="text-xs mt-1 text-right" style={{ color: description.length > 1800 ? 'var(--apple-red)' : 'var(--apple-mid)' }}>
                  {description.length}/2000
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 py-3" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Saving…
                    </span>
                  ) : 'Save Changes'}
                </button>
                <Link href="/profile" className="btn-secondary px-5 py-3">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
