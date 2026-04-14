import React, { ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../lib/api';

interface Props { children: ReactNode; }

export default function Layout({ children }: Props) {
  const [loggedIn, setLoggedIn]         = useState(false);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [userEmail, setUserEmail]       = useState('');
  const [userName, setUserName]         = useState('');
  const [menuOpen, setMenuOpen]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router  = useRouter();

  // detect scroll for nav shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    setLoggedIn(!!token);
    if (token) {
      api.get('/users/me').then(r => {
        setUserEmail(r.data.email || '');
        setUserName(r.data.name || '');
      }).catch(() => {});
    }
  }, [router.asPath]);

  useEffect(() => {
    if (!loggedIn) { setUnreadCount(0); return; }
    api.get('/notifications/unread-count').then(r => setUnreadCount(r.data.count || 0)).catch(() => {});
  }, [loggedIn, router.asPath]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setMenuOpen(false);
    setMobileOpen(false);
    router.push('/');
  };

  const displayName = userName || userEmail.split('@')[0] || 'Account';
  const initials = displayName.slice(0, 2).toUpperCase();
  const isActive = (path: string) => router.pathname === path || router.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--apple-gray)' }}>
      {/* ── Navigation ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 nav-blur transition-shadow duration-300"
        style={{
          background: scrolled ? 'rgba(245,245,247,0.85)' : 'rgba(245,245,247,0.72)',
          borderBottom: '1px solid var(--apple-border)',
          boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-[52px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'var(--apple-blue)' }}
              >
                F
              </div>
              <span className="font-semibold text-[17px]" style={{ color: 'var(--apple-dark)', letterSpacing: '-0.02em' }}>
                FindSpace
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/listings" active={isActive('/listings')}>Listings</NavLink>
              {loggedIn && (
                <>
                  <NavLink href="/add-listing" active={isActive('/add-listing')}>Add Listing</NavLink>
                  <NavLink href="/messages" active={isActive('/messages')}>Messages</NavLink>
                  <NavLink href="/notifications" active={isActive('/notifications')}>
                    <span className="relative inline-flex items-center">
                      Notifications
                      {unreadCount > 0 && (
                        <span
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] text-white font-semibold"
                          style={{ background: 'var(--apple-red)' }}
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </span>
                  </NavLink>
                </>
              )}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {loggedIn ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(o => !o)}
                    className="flex items-center gap-2 rounded-full pr-3 pl-1 py-1 transition-colors"
                    style={{ background: menuOpen ? 'rgba(0,0,0,0.06)' : 'transparent' }}
                    aria-label="Account menu"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                      style={{ background: 'var(--apple-blue)' }}
                    >
                      {initials}
                    </div>
                    <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]" style={{ color: 'var(--apple-dark)' }}>
                      {displayName}
                    </span>
                    <svg className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--apple-mid)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden"
                      style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: '1px solid var(--apple-border)' }}
                    >
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--apple-border)' }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--apple-mid)' }}>Signed in as</p>
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--apple-dark)' }}>{userEmail}</p>
                      </div>
                      <div className="py-1">
                        <DropdownItem href="/profile" onClick={() => setMenuOpen(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                          My Profile
                        </DropdownItem>
                        <DropdownItem href="/messages" onClick={() => setMenuOpen(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                          Messages
                        </DropdownItem>
                        <DropdownItem href="/notifications" onClick={() => setMenuOpen(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                          Notifications {unreadCount > 0 && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full text-white font-semibold" style={{ background: 'var(--apple-red)' }}>{unreadCount}</span>}
                        </DropdownItem>
                        <div className="my-1 border-t" style={{ borderColor: 'var(--apple-border)' }} />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                          style={{ color: 'var(--apple-red)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,59,48,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="btn-secondary text-sm py-1.5 px-4">Sign In</Link>
                  <Link href="/register" className="btn-primary text-sm py-1.5 px-4">Sign Up</Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-xl transition-colors"
                style={{ color: 'var(--apple-dark)' }}
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t" style={{ background: 'rgba(245,245,247,0.95)', borderColor: 'var(--apple-border)' }}>
            <div className="page-container py-3 flex flex-col gap-1">
              <MobileLink href="/listings" onClick={() => setMobileOpen(false)}>Listings</MobileLink>
              {loggedIn ? (
                <>
                  <MobileLink href="/add-listing" onClick={() => setMobileOpen(false)}>Add Listing</MobileLink>
                  <MobileLink href="/profile" onClick={() => setMobileOpen(false)}>My Profile</MobileLink>
                  <MobileLink href="/messages" onClick={() => setMobileOpen(false)}>Messages</MobileLink>
                  <MobileLink href="/notifications" onClick={() => setMobileOpen(false)}>
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </MobileLink>
                  <button onClick={handleLogout} className="text-left px-3 py-2 rounded-xl text-sm font-medium" style={{ color: 'var(--apple-red)' }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <MobileLink href="/login" onClick={() => setMobileOpen(false)}>Sign In</MobileLink>
                  <MobileLink href="/register" onClick={() => setMobileOpen(false)}>Sign Up</MobileLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ background: '#f5f5f7', borderTop: '1px solid var(--apple-border)' }}>
        <div className="page-container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--apple-blue)' }}>F</div>
              <span className="font-semibold text-sm" style={{ color: 'var(--apple-dark)' }}>FindSpace</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--apple-mid)' }}>
              © {new Date().getFullYear()} FindSpace. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="/listings" className="text-xs hover:underline" style={{ color: 'var(--apple-mid)' }}>Listings</Link>
              <Link href="/register" className="text-xs hover:underline" style={{ color: 'var(--apple-mid)' }}>Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
      style={{
        color: active ? 'var(--apple-blue)' : 'var(--apple-dark)',
        background: active ? 'rgba(0,113,227,0.08)' : 'transparent',
      }}
    >
      {children}
    </Link>
  );
}

function DropdownItem({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
      style={{ color: 'var(--apple-dark)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--apple-gray)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-2 rounded-xl text-sm font-medium"
      style={{ color: 'var(--apple-dark)' }}
    >
      {children}
    </Link>
  );
}
