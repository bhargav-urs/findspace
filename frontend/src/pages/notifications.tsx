import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import Layout from '../components/Layout';

interface NotificationItem { id: number; content: string; read: boolean; createdAt: string; }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [clearing, setClearing]           = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) { router.push('/login'); return; }
    api.get('/notifications')
      .then(r => {
        setNotifications(r.data);
        r.data.filter((n: NotificationItem) => !n.read).forEach((n: NotificationItem) => {
          api.put(`/notifications/${n.id}/read`).catch(() => {});
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleClear = async () => {
    setClearing(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      router.replace({ pathname: router.pathname, query: { t: Date.now() } }, undefined, { shallow: true });
    } catch {} finally { setClearing(false); }
  };

  const unread = notifications.filter(n => !n.read);

  return (
    <Layout>
      <div className="page-container py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 style={{ color: 'var(--apple-dark)', fontSize: '1.75rem' }}>Notifications</h1>
              {unread.length > 0 && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--apple-blue)' }}>
                  {unread.length} unread
                </p>
              )}
            </div>
            {notifications.length > 0 && (
              <button onClick={handleClear} disabled={clearing} className="btn-secondary text-sm px-4 py-2">
                {clearing ? 'Clearing…' : 'Mark all read'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="card p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="card p-14 text-center">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--apple-dark)' }}>All caught up!</h3>
              <p className="text-sm" style={{ color: 'var(--apple-mid)' }}>You have no notifications right now.</p>
            </div>
          ) : (
            <div className="card divide-y overflow-hidden" style={{ border: '1px solid var(--apple-border)' }}>
              {notifications.map((n, i) => (
                <div key={n.id}
                  className="flex gap-4 px-5 py-4 transition-colors relative"
                  style={{ background: n.read ? 'transparent' : 'rgba(0,113,227,0.04)' }}>
                  {!n.read && (
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--apple-blue)' }} />
                  )}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ background: n.read ? 'var(--apple-gray)' : 'rgba(0,113,227,0.1)' }}>
                    <svg className="w-4 h-4" style={{ color: n.read ? 'var(--apple-mid)' : 'var(--apple-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug" style={{ color: n.read ? 'var(--apple-mid)' : 'var(--apple-dark)', fontWeight: n.read ? 400 : 500 }}>
                      {n.content}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--apple-mid)' }}>
                      {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
