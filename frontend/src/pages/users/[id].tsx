import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../lib/api';
import Layout from '../../components/Layout';

interface PublicListing {
  id: number; title: string; description: string;
  rent: number; address?: string; createdAt: string;
}
interface PublicProfile {
  id: number; email: string; name: string; phone: string;
  about: string; createdAt: string; role: string;
  listings: PublicListing[];
}

export default function PublicProfilePage() {
  const router   = useRouter();
  const { id }   = router.query;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    // Must be logged in to view profiles
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login'); return;
    }
    api.get(`/users/${id}`)
      .then(r => { setProfile(r.data); setLoading(false); })
      .catch(err => {
        setError(err?.response?.status === 404 ? 'User not found.' : 'Could not load profile.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <Layout>
      <div className="page-container py-16 text-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
             style={{ borderColor: 'var(--apple-border)', borderTopColor: 'var(--apple-blue)' }} />
        <p className="mt-4 text-sm" style={{ color: 'var(--apple-mid)' }}>Loading profile…</p>
      </div>
    </Layout>
  );

  if (error || !profile) return (
    <Layout>
      <div className="page-container py-16 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="font-semibold mb-2" style={{ color: 'var(--apple-dark)' }}>{error || 'Profile not found'}</h2>
        <button onClick={() => router.back()} className="btn-secondary mt-4">Go Back</button>
      </div>
    </Layout>
  );

  const displayName  = profile.name || profile.email.split('@')[0];
  const initials     = displayName.slice(0, 2).toUpperCase();
  const memberSince  = new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const listingCount = profile.listings.length;
  const hue          = (profile.id * 83) % 360;

  return (
    <Layout>
      <div className="page-container py-10">
        <div className="max-w-2xl mx-auto">

          {/* ── Back button ─────────────────────────────── */}
          <button onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm mb-6"
            style={{ color: 'var(--apple-mid)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>

          {/* ── Profile hero card ───────────────────────── */}
          <div className="card overflow-hidden mb-5">
            <div className="h-20 w-full"
                 style={{ background: `linear-gradient(135deg, hsl(${hue},55%,45%) 0%, hsl(${(hue+40)%360},60%,60%) 100%)` }} />
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold border-4 border-white flex-shrink-0"
                  style={{ background: `hsl(${hue},55%,50%)`, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
                >
                  {initials}
                </div>
                <div className="flex-1">
                  <h1 className="font-bold" style={{ color: 'var(--apple-dark)', fontSize: '1.4rem' }}>
                    {displayName}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--apple-mid)' }}>{profile.email}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-6 flex-wrap">
                <StatPill label="Member since" value={memberSince} />
                <StatPill label="Listings"     value={String(listingCount)} />
                <StatPill label="Role"         value={profile.role} />
              </div>
            </div>
          </div>

          {/* ── About ───────────────────────────────────── */}
          <div className="card p-6 mb-5">
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--apple-dark)' }}>About</h2>
            <div className="space-y-4">
              <InfoRow
                icon="👤"
                label="Full Name"
                value={profile.name}
                empty="Name not added"
              />
              <InfoRow
                icon="📞"
                label="Phone"
                value={profile.phone}
                empty="Phone not added"
              />
              <InfoRow
                icon="✍️"
                label="About"
                value={profile.about}
                empty="No bio added yet"
                multiline
              />
            </div>
          </div>

          {/* ── Listings ────────────────────────────────── */}
          <div className="card p-6">
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--apple-dark)' }}>
              Active Listings
              {listingCount > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-normal"
                      style={{ background: 'rgba(0,113,227,0.1)', color: 'var(--apple-blue)' }}>
                  {listingCount}
                </span>
              )}
            </h2>

            {listingCount === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🏠</div>
                <p className="text-sm" style={{ color: 'var(--apple-mid)' }}>No listings posted yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.listings.map(l => (
                  <Link key={l.id} href={`/listings/${l.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl transition-colors"
                    style={{ background: 'var(--apple-gray)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,113,227,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--apple-gray)')}
                  >
                    <div className="w-1 self-stretch rounded-full flex-shrink-0"
                         style={{ background: `hsl(${(l.id * 47) % 360},60%,58%)` }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--apple-dark)' }}>{l.title}</p>
                      {l.address && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--apple-mid)' }}>{l.address}</p>
                      )}
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--apple-mid)' }}>{l.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold" style={{ color: 'var(--apple-blue)' }}>${l.rent}/mo</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--apple-mid)' }}>View →</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function InfoRow({
  icon, label, value, empty, multiline = false,
}: {
  icon: string; label: string; value: string; empty: string; multiline?: boolean;
}) {
  const hasValue = value && value.trim().length > 0;
  return (
    <div className="flex gap-3">
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--apple-mid)' }}>{label}</p>
        {hasValue ? (
          multiline ? (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--apple-dark)' }}>{value}</p>
          ) : (
            <p className="text-sm font-medium" style={{ color: 'var(--apple-dark)' }}>{value}</p>
          )
        ) : (
          <p className="text-sm italic" style={{ color: 'var(--apple-border)' }}>{empty}</p>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
         style={{ background: 'var(--apple-gray)', color: 'var(--apple-mid)' }}>
      <span className="font-semibold" style={{ color: 'var(--apple-dark)' }}>{value}</span>
      <span>{label}</span>
    </div>
  );
}
