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
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [maxRent, setMaxRent]   = useState('');

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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {/* Pure CSS gradient hero — no image dependency, always looks sharp   */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: '600px',
          background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 35%, #0f2b5b 55%, #1a1a2e 80%, #0a0a1a 100%)',
        }}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large blue orb top-right */}
          <div style={{
            position: 'absolute', top: '-10%', right: '-5%',
            width: '520px', height: '520px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,113,227,0.35) 0%, rgba(0,113,227,0) 70%)',
          }} />
          {/* Medium teal orb bottom-left */}
          <div style={{
            position: 'absolute', bottom: '-15%', left: '-5%',
            width: '420px', height: '420px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(90,200,250,0.2) 0%, rgba(90,200,250,0) 70%)',
          }} />
          {/* Small accent orb centre */}
          <div style={{
            position: 'absolute', top: '30%', left: '40%',
            width: '240px', height: '240px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(94,92,230,0.18) 0%, rgba(94,92,230,0) 70%)',
          }} />
          {/* Grid overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          {/* Floating dots */}
          {[
            { top:'15%', left:'8%', size:3, opacity:0.5 },
            { top:'25%', left:'22%', size:2, opacity:0.3 },
            { top:'60%', left:'15%', size:4, opacity:0.4 },
            { top:'70%', left:'35%', size:2, opacity:0.3 },
            { top:'20%', right:'15%', size:3, opacity:0.5 },
            { top:'45%', right:'8%', size:2, opacity:0.35 },
            { top:'75%', right:'20%', size:4, opacity:0.4 },
          ].map((dot, i) => (
            <div key={i} style={{
              position: 'absolute', top: dot.top, left: (dot as any).left, right: (dot as any).right,
              width: `${dot.size}px`, height: `${dot.size}px`, borderRadius: '50%',
              background: 'rgba(255,255,255,' + dot.opacity + ')',
            }} />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 page-container flex flex-col items-center justify-center text-center py-32 gap-6">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium animate-fadeIn"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#30d158' }} />
            Listings updated daily
          </div>

          {/* Headline */}
          <h1 className="animate-fadeUp" style={{ maxWidth: '680px', color: '#fff', fontSize: 'clamp(2.2rem, 5.5vw, 3.75rem)', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
            Find your perfect<br />
            <span style={{ background: 'linear-gradient(90deg, #5ac8fa, #0071e3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              space
            </span>{' '}in minutes
          </h1>

          <p className="animate-fadeUp delay-100" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '460px', fontSize: '1.125rem', lineHeight: 1.55 }}>
            Browse rooms and apartments, connect with owners directly, and move in with confidence.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap justify-center animate-fadeUp delay-200">
            <Link href="/listings" className="btn-primary text-base px-7 py-3" style={{ background: 'var(--apple-blue)', fontSize: '0.9375rem' }}>
              Browse Listings
            </Link>
            <Link href="/register" className="btn-secondary text-base px-7 py-3"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.9375rem' }}>
              Sign Up Free
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-6 animate-fadeUp delay-300">
            {[['10+', 'Active listings'], ['100%', 'Free to join'], ['⚡', 'Instant messaging']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#fff' }}>{val}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search Bar ────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--apple-border)' }}>
        <div className="page-container py-5">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* FIX 1: Search icon — increased padding so icon doesn't overlap text */}
            <div className="flex-1 relative">
              <svg
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ left: '14px', color: 'var(--apple-mid)' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                className="input"
                style={{ paddingLeft: '42px' }}
                placeholder="Search by title, city, or neighborhood…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* FIX 2: Max rent — removed conflicting placeholder, "Max $" prefix is the label */}
            <div className="relative sm:w-52">
              <span
                className="absolute top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none select-none"
                style={{ left: '14px', color: 'var(--apple-mid)' }}
              >
                Max $
              </span>
              <input
                className="input"
                type="number"
                min="0"
                style={{ paddingLeft: '52px' }}
                placeholder=""
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

      {/* ── Listings Grid ─────────────────────────────────────────────────── */}
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

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--apple-border)' }}>
        <div className="page-container py-16 text-center">
          <h2 className="mb-2" style={{ color: 'var(--apple-dark)' }}>Everything you need</h2>
          <p style={{ color: 'var(--apple-mid)', maxWidth: '500px', margin: '0.5rem auto 3rem' }}>
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

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b3e 50%, #0071e3 100%)' }}>
        <div className="page-container py-16 text-center">
          <h2 style={{ color: '#fff' }} className="mb-3">Ready to find your space?</h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Join hundreds of renters who found their home on FindSpace.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-base font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
          >
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
  return (
    <Link href={`/listings/${listing.id}`}
      className="card block overflow-hidden animate-fadeUp"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      <div className="h-2" style={{ background: `hsl(${(listing.id * 47) % 360}, 65%, 60%)` }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-base leading-snug line-clamp-2" style={{ color: 'var(--apple-dark)' }}>
            {listing.title}
          </h3>
          <span className="flex-shrink-0 text-sm font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,113,227,0.1)', color: 'var(--apple-blue)' }}>
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
