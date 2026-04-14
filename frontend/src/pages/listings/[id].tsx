import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import Layout from '../../components/Layout';

interface Listing { id: number; title: string; description: string; rent: number; address?: string; createdAt: string; ownerId?: number; ownerEmail?: string; ownerName?: string; }

export default function ListingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing]               = useState<Listing | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [message, setMessage]               = useState('');
  const [sending, setSending]               = useState(false);
  const [success, setSuccess]               = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loggedIn, setLoggedIn]             = useState(false);

  useEffect(() => {
    if (!id) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setLoggedIn(!!token);
    async function fetchData() {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
        if (token) {
          try { const me = await api.get('/users/me'); setCurrentUserEmail(me.data.email); } catch {}
        }
      } catch { setError('Listing not found or has been removed.'); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing?.ownerEmail || !message.trim()) return;
    setSending(true); setSuccess(null); setError(null);
    try {
      await api.post('/messages/start', { receiverEmail: listing.ownerEmail, listingId: listing.id, content: message });
      setSuccess('Message sent! Check your Messages tab for the conversation.');
      setMessage('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send message. Are you logged in?');
    } finally { setSending(false); }
  };

  const isOwner = listing?.ownerEmail && currentUserEmail && listing.ownerEmail === currentUserEmail;
  const ownerDisplay = listing?.ownerName || listing?.ownerEmail?.split('@')[0] || 'Owner';
  const ownerInitials = ownerDisplay.slice(0, 2).toUpperCase();

  return (
    <Layout>
      <div className="page-container py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--apple-mid)' }}>
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/listings" className="hover:underline">Listings</Link>
          <span>/</span>
          <span style={{ color: 'var(--apple-dark)' }}>{loading ? '…' : listing?.title}</span>
        </div>

        {loading && (
          <div className="card p-8 space-y-4 animate-pulse">
            <div className="skeleton h-8 w-2/3 rounded-xl" />
            <div className="skeleton h-5 w-1/4 rounded-xl" />
            <div className="skeleton h-4 w-full rounded-xl" />
            <div className="skeleton h-4 w-5/6 rounded-xl" />
          </div>
        )}

        {error && (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-3">😕</div>
            <h2 className="font-semibold mb-1" style={{ color: 'var(--apple-dark)' }}>Listing not found</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--apple-mid)' }}>{error}</p>
            <Link href="/listings" className="btn-primary">Back to Listings</Link>
          </div>
        )}

        {listing && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Title card */}
              <div className="card overflow-hidden">
                <div className="h-3" style={{ background: `hsl(${(listing.id * 47) % 360}, 60%, 58%)` }} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--apple-dark)', fontSize: 'clamp(1.4rem,3vw,1.875rem)' }}>{listing.title}</h1>
                      {listing.address && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--apple-mid)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          </svg>
                          <span className="text-sm" style={{ color: 'var(--apple-mid)' }}>{listing.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-bold" style={{ color: 'var(--apple-blue)' }}>${listing.rent}</div>
                      <div className="text-sm" style={{ color: 'var(--apple-mid)' }}>per month</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--apple-dark)' }}>About this listing</h2>
                <p className="leading-relaxed" style={{ color: 'var(--apple-mid)', fontSize: '0.9375rem' }}>{listing.description}</p>
              </div>

              {/* Details */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-dark)' }}>Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Detail label="Monthly Rent" value={`$${listing.rent}`} />
                  {listing.address && <Detail label="Location" value={listing.address} />}
                  <Detail label="Listed On" value={new Date(listing.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                  <Detail label="Status" value="Available" badge="green" />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Owner card */}
              <div className="card p-6">
                <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--apple-dark)' }}>Listed by</h2>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
                       style={{ background: `hsl(${(listing.ownerId || 1) * 83 % 360}, 60%, 55%)` }}>
                    {ownerInitials}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--apple-dark)' }}>{ownerDisplay}</p>
                    <p className="text-xs" style={{ color: 'var(--apple-mid)' }}>Space Owner</p>
                  </div>
                </div>

                {success && (
                  <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(48,209,88,0.12)', color: '#25a244' }}>
                    ✓ {success}
                  </div>
                )}
                {error && !loading && (
                  <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--apple-red)' }}>
                    {error}
                  </div>
                )}

                {isOwner ? (
                  <div className="p-3 rounded-xl text-sm text-center" style={{ background: 'var(--apple-gray)', color: 'var(--apple-mid)' }}>
                    This is your listing
                  </div>
                ) : loggedIn ? (
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <textarea
                      className="input text-sm"
                      placeholder="Hi! I'm interested in your listing…"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={4}
                      required
                    />
                    <button type="submit" className="btn-primary w-full" disabled={sending}>
                      {sending ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center space-y-3">
                    <p className="text-sm" style={{ color: 'var(--apple-mid)' }}>Sign in to contact the owner</p>
                    <Link href="/login" className="btn-primary w-full block text-center">Sign In</Link>
                    <Link href="/register" className="btn-secondary w-full block text-center text-sm">Create Account</Link>
                  </div>
                )}
              </div>

              {/* Tips card */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--apple-dark)' }}>💡 Renting tips</h3>
                <ul className="space-y-2 text-xs" style={{ color: 'var(--apple-mid)' }}>
                  <li>• Always visit the property before signing</li>
                  <li>• Confirm utilities are included in rent</li>
                  <li>• Ask about lease duration and policies</li>
                  <li>• Get everything in writing</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Detail({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'var(--apple-gray)' }}>
      <p className="text-xs mb-1" style={{ color: 'var(--apple-mid)' }}>{label}</p>
      {badge === 'green' ? (
        <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: '#25a244' }}>
          <span className="w-2 h-2 rounded-full bg-green-400" />
          {value}
        </span>
      ) : (
        <p className="text-sm font-semibold" style={{ color: 'var(--apple-dark)' }}>{value}</p>
      )}
    </div>
  );
}
