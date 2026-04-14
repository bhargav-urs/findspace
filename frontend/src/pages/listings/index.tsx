import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import Layout from '../../components/Layout';

interface Listing { id: number; title: string; description: string; rent: number; address?: string; createdAt?: string; }

type SortKey = 'newest' | 'priceAsc' | 'priceDesc';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [maxRent, setMaxRent]   = useState('');
  const [sort, setSort]         = useState<SortKey>('newest');

  useEffect(() => {
    api.get('/listings').then(r => { setListings(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = listings
    .filter(l => {
      const q = search.toLowerCase();
      const matchText = !q || l.title.toLowerCase().includes(q) || (l.address || '').toLowerCase().includes(q) || (l.description || '').toLowerCase().includes(q);
      const matchRent = !maxRent || l.rent <= parseFloat(maxRent);
      return matchText && matchRent;
    })
    .sort((a, b) => {
      if (sort === 'priceAsc')  return a.rent - b.rent;
      if (sort === 'priceDesc') return b.rent - a.rent;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  return (
    <Layout>
      <div className="page-container py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-1" style={{ color: 'var(--apple-dark)' }}>All Listings</h1>
          <p style={{ color: 'var(--apple-mid)' }}>Find the perfect room or apartment in your area.</p>
        </div>

        {/* Filters */}
        <div className="card p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--apple-mid)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input className="input pl-10" placeholder="Search listings…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="relative sm:w-44">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: 'var(--apple-mid)' }}>Max $</span>
              <input className="input pl-10" type="number" placeholder="Any rent" value={maxRent} onChange={e => setMaxRent(e.target.value)} />
            </div>
            <select className="input sm:w-44" value={sort} onChange={e => setSort(e.target.value as SortKey)}
              style={{ appearance: 'none', cursor: 'pointer' }}>
              <option value="newest">Newest first</option>
              <option value="priceAsc">Price: Low → High</option>
              <option value="priceDesc">Price: High → Low</option>
            </select>
            {(search || maxRent) && (
              <button className="btn-secondary text-sm" onClick={() => { setSearch(''); setMaxRent(''); }}>Clear</button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm mb-5" style={{ color: 'var(--apple-mid)' }}>
          {loading ? 'Loading…' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--apple-dark)' }}>No listings found</h3>
            <p className="text-sm" style={{ color: 'var(--apple-mid)' }}>Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((l, i) => (
              <Link key={l.id} href={`/listings/${l.id}`}
                className="card block overflow-hidden animate-fadeUp"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
                <div className="h-2" style={{ background: `hsl(${(l.id * 47) % 360}, 60%, 58%)` }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-base line-clamp-2" style={{ color: 'var(--apple-dark)' }}>{l.title}</h3>
                    <span className="flex-shrink-0 text-sm font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: 'rgba(0,113,227,0.1)', color: 'var(--apple-blue)' }}>
                      ${l.rent}/mo
                    </span>
                  </div>
                  {l.address && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--apple-mid)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                      <span className="text-xs truncate" style={{ color: 'var(--apple-mid)' }}>{l.address}</span>
                    </div>
                  )}
                  <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--apple-mid)' }}>{l.description}</p>
                  <div className="flex justify-end mt-4 pt-3" style={{ borderTop: '1px solid var(--apple-border)' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--apple-blue)' }}>View details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
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
