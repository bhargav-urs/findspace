import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/api';
import Layout from '../components/Layout';

export default function AddListingPage() {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent]             = useState('');
  const [address, setAddress]       = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) router.push('/login');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      const res = await api.post('/listings', { title, description, rent: parseFloat(rent), address });
      router.push(`/listings/${res.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create listing. Are you logged in?');
      setSaving(false);
    }
  };

  const charCount = description.length;
  const maxChars  = 2000;

  return (
    <Layout>
      <div className="page-container py-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm mb-4" style={{ color: 'var(--apple-mid)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Listings
            </Link>
            <h1 style={{ color: 'var(--apple-dark)', fontSize: '1.75rem' }}>Add a new listing</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--apple-mid)' }}>Fill in the details about your space and start receiving enquiries.</p>
          </div>

          <div className="card p-7">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--apple-red)' }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="title" className="label">Listing Title <span style={{ color: 'var(--apple-red)' }}>*</span></label>
                <input id="title" type="text" className="input" placeholder="e.g., Sunny Room in Downtown Arlington"
                  value={title} onChange={e => setTitle(e.target.value)} required maxLength={120} />
                <p className="text-xs mt-1 text-right" style={{ color: 'var(--apple-mid)' }}>{title.length}/120</p>
              </div>

              <div>
                <label htmlFor="rent" className="label">Monthly Rent (USD) <span style={{ color: 'var(--apple-red)' }}>*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-medium" style={{ color: 'var(--apple-mid)' }}>$</span>
                  <input id="rent" type="number" step="1" min="1" max="99999" className="input pl-7"
                    placeholder="750" value={rent} onChange={e => setRent(e.target.value)} required />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--apple-mid)' }}>/mo</span>
                </div>
              </div>

              <div>
                <label htmlFor="address" className="label">Address</label>
                <input id="address" type="text" className="input" placeholder="e.g., 123 Main St, Arlington, TX"
                  value={address} onChange={e => setAddress(e.target.value)} />
                <p className="text-xs mt-1" style={{ color: 'var(--apple-mid)' }}>Optional — helps renters find your space.</p>
              </div>

              <div>
                <label htmlFor="description" className="label">Description <span style={{ color: 'var(--apple-red)' }}>*</span></label>
                <textarea id="description" className="input" rows={6}
                  placeholder="Describe your space: size, amenities, nearby transport, house rules…"
                  value={description} onChange={e => setDescription(e.target.value)} required maxLength={maxChars} />
                <p className="text-xs mt-1 text-right" style={{ color: charCount > maxChars * 0.9 ? 'var(--apple-red)' : 'var(--apple-mid)' }}>
                  {charCount}/{maxChars}
                </p>
              </div>

              {/* Preview */}
              {title && rent && (
                <div className="rounded-xl p-4" style={{ background: 'var(--apple-gray)', border: '1px solid var(--apple-border)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--apple-mid)' }}>Preview</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--apple-dark)' }}>{title}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--apple-blue)' }}>${rent}/mo</p>
                  {address && <p className="text-xs mt-0.5" style={{ color: 'var(--apple-mid)' }}>{address}</p>}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 py-3" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Publishing…
                    </span>
                  ) : 'Publish Listing'}
                </button>
                <Link href="/listings" className="btn-secondary px-5 py-3">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
