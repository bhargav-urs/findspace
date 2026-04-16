import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/api';
import Layout from '../components/Layout';

interface UserListing { id: number; title: string; description: string; rent: number; address?: string; createdAt: string; }
interface Profile { id: number; email: string; role: string; createdAt: string; name?: string; phone?: string; about?: string; listings?: UserListing[]; }

type Tab = 'info' | 'listings' | 'security';

export default function ProfilePage() {
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [name, setName]               = useState('');
  const [phone, setPhone]             = useState('');
  const [about, setAbout]             = useState('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState('');
  const [saveErr, setSaveErr]         = useState('');
  const [tab, setTab]                 = useState<Tab>('info');
  const [oldPwd, setOldPwd]           = useState('');
  const [newPwd, setNewPwd]           = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [pwdMsg, setPwdMsg]           = useState('');
  const [pwdErr, setPwdErr]           = useState('');
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.push('/login'); return; }
    api.get('/users/me')
      .then(r => {
        setProfile(r.data);
        setName(r.data.name || '');
        setPhone(r.data.phone || '');
        setAbout(r.data.about || '');
      })
      .catch((err) => {
        // Only force-logout on 401 (token expired/invalid)
        // For other errors (network, 500) stay on the page and show error
        if (err?.response?.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          setSaveErr('Could not load profile. The server may be waking up — please refresh in a moment.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaveMsg(''); setSaveErr('');
    try {
      await api.put('/users/me', { name, phone, about });
      const r = await api.get('/users/me');
      setProfile(r.data); setName(r.data.name || ''); setPhone(r.data.phone || ''); setAbout(r.data.about || '');
      setSaveMsg('Profile updated successfully!');
    } catch { setSaveErr('Failed to save changes. Please try again.'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPwdMsg(''); setPwdErr('');
    if (newPwd !== confirmPwd) { setPwdErr('New passwords do not match.'); return; }
    if (newPwd.length < 6) { setPwdErr('Password must be at least 6 characters.'); return; }
    try {
      await api.put('/users/me/password', { oldPassword: oldPwd, newPassword: newPwd });
      setPwdMsg('Password changed successfully!');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: any) {
      setPwdErr(err?.response?.data?.error || 'Failed to change password.');
    }
  };

  const handleDelete = async (listingId: number) => {
    setDeletingId(listingId);
    try {
      await api.delete(`/listings/${listingId}`);
      setProfile(prev => prev ? { ...prev, listings: (prev.listings || []).filter(l => l.id !== listingId) } : prev);
    } catch { }
    finally { setDeletingId(null); }
  };

  if (loading) return <Layout><div className="page-container py-16 text-center"><Spinner /></div></Layout>;
  if (!profile) return (
    <Layout>
      <div className="page-container py-16 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="font-semibold mb-2" style={{ color: 'var(--apple-dark)' }}>Could not load profile</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--apple-mid)' }}>
          The server may be starting up. Please wait a moment and refresh.
        </p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Refresh</button>
      </div>
    </Layout>
  );

  const displayName = profile.name || profile.email.split('@')[0];
  const initials    = displayName.slice(0, 2).toUpperCase();
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const listingCount = (profile.listings || []).length;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'info',     label: 'Personal Info' },
    { key: 'listings', label: `My Listings (${listingCount})` },
    { key: 'security', label: 'Security' },
  ];

  return (
    <Layout>
      <div className="page-container py-10">
        {/* ── Profile hero ─────────────────────────────────────── */}
        <div className="card overflow-hidden mb-6">
          <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg, var(--apple-blue) 0%, #5ac8fa 100%)' }} />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold border-4 border-white flex-shrink-0"
                style={{ background: `hsl(${(profile.id * 83) % 360}, 55%, 55%)`, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
              >
                {initials}
              </div>
              <div className="flex-1 sm:mb-1">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--apple-dark)', fontSize: '1.5rem' }}>{displayName}</h1>
                <p className="text-sm" style={{ color: 'var(--apple-mid)' }}>{profile.email}</p>
              </div>
              <div className="flex gap-6">
                <Stat label="Listings" value={listingCount} />
                <Stat label="Member since" value={memberSince} />
                <Stat label="Role" value={profile.role} />
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 border-b" style={{ borderColor: 'var(--apple-border)' }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="px-4 py-2 text-sm font-medium transition-colors relative"
                  style={{ color: tab === t.key ? 'var(--apple-blue)' : 'var(--apple-mid)' }}>
                  {t.label}
                  {tab === t.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--apple-blue)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab: Personal Info ───────────────────────────────── */}
        {tab === 'info' && (
          <div className="card p-6 max-w-xl">
            <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--apple-dark)' }}>Personal Information</h2>
            {saveMsg && <Alert type="success" msg={saveMsg} onDismiss={() => setSaveMsg('')} />}
            {saveErr && <Alert type="error" msg={saveErr} onDismiss={() => setSaveErr('')} />}
            <form onSubmit={handleSave} className="space-y-4">
              <FormField label="Full Name" htmlFor="name">
                <input id="name" className="input" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
              </FormField>
              <FormField label="Email Address" htmlFor="email">
                <input id="email" className="input opacity-60 cursor-not-allowed" value={profile.email} readOnly />
                <p className="text-xs mt-1" style={{ color: 'var(--apple-mid)' }}>Email cannot be changed.</p>
              </FormField>
              <FormField label="Phone Number" htmlFor="phone">
                <input id="phone" className="input" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
              </FormField>
              <FormField label="About Me" htmlFor="about">
                <textarea id="about" className="input" placeholder="Tell hosts and tenants a bit about yourself…" value={about} onChange={e => setAbout(e.target.value)} rows={4} />
              </FormField>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* ── Tab: My Listings ─────────────────────────────────── */}
        {tab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--apple-dark)' }}>My Listings</h2>
              <Link href="/add-listing" className="btn-primary text-sm px-4 py-2">
                + Add New Listing
              </Link>
            </div>
            {listingCount === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--apple-dark)' }}>No listings yet</h3>
                <p className="text-sm mb-6" style={{ color: 'var(--apple-mid)' }}>Share your space and start receiving enquiries.</p>
                <Link href="/add-listing" className="btn-primary">Create your first listing</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(profile.listings || []).map(l => (
                  <div key={l.id} className="card p-5 flex gap-4">
                    <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: `hsl(${(l.id * 47) % 360}, 60%, 58%)` }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/listings/${l.id}`} className="font-semibold text-sm hover:underline" style={{ color: 'var(--apple-dark)' }}>
                            {l.title}
                          </Link>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--apple-blue)' }}>${l.rent}/mo</p>
                          {l.address && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--apple-mid)' }}>{l.address}</p>}
                        </div>
                        <button onClick={() => handleDelete(l.id)} disabled={deletingId === l.id} className="btn-danger flex-shrink-0 text-xs">
                          {deletingId === l.id ? '…' : 'Delete'}
                        </button>
                      </div>
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--apple-mid)' }}>{l.description}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--apple-mid)' }}>
                        Posted {new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Security ────────────────────────────────────── */}
        {tab === 'security' && (
          <div className="card p-6 max-w-xl">
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--apple-dark)' }}>Change Password</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--apple-mid)' }}>Use a strong password with letters, numbers, and symbols.</p>
            {pwdMsg && <Alert type="success" msg={pwdMsg} onDismiss={() => setPwdMsg('')} />}
            {pwdErr && <Alert type="error" msg={pwdErr} onDismiss={() => setPwdErr('')} />}
            <form onSubmit={handlePassword} className="space-y-4">
              <FormField label="Current Password" htmlFor="oldPwd">
                <input id="oldPwd" type="password" className="input" value={oldPwd} onChange={e => setOldPwd(e.target.value)} required />
              </FormField>
              <FormField label="New Password" htmlFor="newPwd">
                <input id="newPwd" type="password" className="input" value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
              </FormField>
              <FormField label="Confirm New Password" htmlFor="confirmPwd">
                <input id="confirmPwd" type="password" className="input" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
              </FormField>
              <button type="submit" className="btn-primary">Update Password</button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold" style={{ color: 'var(--apple-dark)' }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--apple-mid)' }}>{label}</div>
    </div>
  );
}

function FormField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
    </div>
  );
}

function Alert({ type, msg, onDismiss }: { type: 'success' | 'error'; msg: string; onDismiss: () => void }) {
  const isSuccess = type === 'success';
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl mb-4 text-sm"
         style={{ background: isSuccess ? 'rgba(48,209,88,0.12)' : 'rgba(255,59,48,0.1)', color: isSuccess ? '#25a244' : 'var(--apple-red)' }}>
      <span>{isSuccess ? '✓' : '⚠'} {msg}</span>
      <button onClick={onDismiss} className="flex-shrink-0 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

function Spinner() {
  return <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--apple-border)', borderTopColor: 'var(--apple-blue)' }} />;
}