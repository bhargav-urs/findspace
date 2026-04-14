import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../lib/api';
import Layout from '../components/Layout';

interface Listing {
  id: number; title: string; description: string;
  rent: number; address?: string; ownerName?: string; createdAt?: string;
}

const FEATURES = [
  { icon: '🔍', title: 'Smart Search', desc: 'Filter by price, location, and amenities to find your perfect space.' },
  { icon: '💬', title: 'Direct Messaging', desc: 'Contact landlords and hosts instantly without sharing your email.' },
  { icon: '🔔', title: 'Real-time Alerts', desc: 'Get notified the moment a new listing matches your criteria.' },
  { icon: '⚡', title: 'Fast & Secure', desc: 'Built with Spring Boot and PostgreSQL for speed and reliability.' },
];

export default function Home() {
  const [listings, setListings]   = useState<Listing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [maxRent, setMaxRent]     = useState('');

  useEffect(() => {
    api.get('/listings').then(r => { setListings(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l => {
    const q = search.toLowerCase();
    const matchText = !q || l.title.toLowerCase().includes(q) || (l.address || '').toLowerCase().includes(q) || (l.description || '').toLowerCase().includes(q);
    const matchRent = !maxRent || l.rent <= parseFloat(maxRent);
    return matchText && matchRent;
  });

  return (
    <Layout>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#000', minHeight: '580px' }}>
        <img
          src="/images/hero_bg.png"
          alt="City skyline"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.55) 100%)' }} />
        <div className="relative z-10 page-container flex flex-col items-center justify-center text-center py-32 gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-2 animate-fadeIn"
               style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Listings updated daily
          </div>
          <h1 className="text-white animate-fadeUp" style={{ maxWidth: '700px' }}>
            Find your perfect space in minutes
          </h1>
          <p className="text-lg animate-fadeUp delay-100" style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '480px' }}>
            Browse unique rooms and apartments, connect with owners directly, and move in with confidence.
          </p>
          <div className="flex gap-3 animate-fadeUp delay-200">
            <Link href="/listings" className="btn-primary text-base px-6 py-3" style={{ background: 'var(--apple-blue)' }}>
              Browse Listings
            </Link>
            <Link href="/register" className="btn-secondary text-base px-6 py-3"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', backdropFilter: 'blur(10px)' }}>
              Sign Up Free
            </Link>
          </div>
          {/* Stats */}
          <div className="flex gap-8 mt-8 animate-fadeUp delay-300">
            {[['10+', 'Active listings'], ['100%', 'Free to join'], ['⚡', 'Instant messaging']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search Bar ─────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--apple-border)' }}>
        <div className="page-container py-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--apple-mid)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                className="input pl-10"
                placeholder="Search by title, city, or neighborhood…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="relative sm:w-52">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--apple-mid)' }}>Max $</span>
              <input
                className="input pl-10"
                type="number"
                placeholder="Any rent"
                value={maxRent}
                onChange={e => setMaxRent(e.target.value)}
              />
            </div>
            {(search || maxRent) && (
              <button className="btn-secondary px-4 text-sm" onClick={() => { setSearch(''); setMaxRent(''); }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Listings Grid ──────────────────────────────────────── */}
      <section className="page-container py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--apple-dark)' }}>
              {search || maxRent ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found` : 'Available Listings'}
            </h2>
            {!search && !maxRent && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--apple-mid)' }}>Handpicked spaces ready to move in</p>
            )}
          </div>
          <Link href="/listings" className="text-sm font-medium" style={{ color: 'var(--apple-blue)' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--apple-mid)' }}>
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium">No listings match your search</p>
            <p className="text-sm mt-1">Try adjusting the filters above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, 6).map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--apple-border)' }}>
        <div className="page-container py-16 text-center">
          <h2 className="mb-2" style={{ color: 'var(--apple-dark)' }}>Everything you need</h2>
          <p className="mb-12" style={{ color: 'var(--apple-mid)', maxWidth: '500px', margin: '0.5rem auto 3rem' }}>
            FindSpace gives tenants and landlords all the tools to make renting effortless.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6 text-left">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--apple-dark)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--apple-mid)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--apple-blue)' }}>
        <div className="page-container py-16 text-center">
          <h2 className="text-white mb-3">Ready to find your space?</h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>Join hundreds of renters who found their home on FindSpace.</p>
          <Link href="/register" className="inline-flex items-center gap-2 btn-secondary text-base px-8 py-3"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            Get started for free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  const delay = `${index * 60}ms`;
  return (
    <Link href={`/listings/${listing.id}`} className="card block overflow-hidden animate-fadeUp" style={{ animationDelay: delay, animationFillMode: 'both' }}>
      {/* Color band */}
      <div className="h-2" style={{ background: `hsl(${(listing.id * 47) % 360}, 65%, 60%)` }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-base leading-snug line-clamp-2" style={{ color: 'var(--apple-dark)' }}>
            {listing.title}
          </h3>
          <span className="flex-shrink-0 text-sm font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,113,227,0.1)', color: 'var(--apple-blue)' }}>
            ${listing.rent}/mo
          </span>
        </div>
        {listing.address && (
          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--apple-mid)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="text-xs truncate" style={{ color: 'var(--apple-mid)' }}>{listing.address}</span>
          </div>
        )}
        <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--apple-mid)' }}>
          {listing.description}
        </p>
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--apple-border)' }}>
          <span className="text-xs" style={{ color: 'var(--apple-mid)' }}>
            {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--apple-blue)' }}>View details →</span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="h-2 skeleton" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-1/2 rounded-lg" />
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-5/6 rounded-lg" />
      </div>
    </div>
  );
}
