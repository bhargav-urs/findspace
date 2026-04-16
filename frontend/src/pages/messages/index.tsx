import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import Layout from '../../components/Layout';

interface Conversation {
  id: number; otherUserId: number; otherUserEmail: string;
  listingId?: number | null;
  lastMessage?: { content: string; senderId: number; sentAt: string; } | null;
}
interface Message { id: number; senderId: number; senderEmail: string; content: string; sentAt: string; }

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId]       = useState<number | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [newMessage, setNewMessage]       = useState('');
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  // Store current user's EMAIL — always reliable, no async timing issues
  const [myEmail, setMyEmail]             = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login'); return;
    }
    // Fetch current user email first, then conversations
    api.get('/users/me')
      .then(r => setMyEmail(r.data.email || ''))
      .catch(() => {});

    api.get('/messages/conversations')
      .then(r => { setConversations(r.data); setLoading(false); })
      .catch(() => { setError('Failed to load conversations.'); setLoading(false); });
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    api.get(`/messages/conversations/${selectedId}`)
      .then(r => setMessages(r.data))
      .catch(() => setError('Failed to load messages.'));
  }, [selectedId]);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !newMessage.trim()) return;
    setSending(true); setError(null);
    const conv = conversations.find(c => c.id === selectedId);
    try {
      await api.post('/messages/start', {
        receiverId: String(conv?.otherUserId),
        listingId: conv?.listingId ? String(conv.listingId) : undefined,
        content: newMessage,
      });
      const r = await api.get(`/messages/conversations/${selectedId}`);
      setMessages(r.data);
      setNewMessage('');
      setConversations(prev =>
        prev.map(c => c.id === selectedId
          ? { ...c, lastMessage: { content: newMessage, senderId: 0, sentAt: new Date().toISOString() } }
          : c
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send.');
    } finally { setSending(false); }
  };

  const selectedConv = conversations.find(c => c.id === selectedId);
  const otherName    = selectedConv ? selectedConv.otherUserEmail.split('@')[0] : '';
  const otherInitials = otherName.slice(0, 2).toUpperCase();

  return (
    <Layout>
      <div className="page-container py-6">
        <h1 className="font-bold mb-5" style={{ color: 'var(--apple-dark)', fontSize: '1.5rem' }}>Messages</h1>

        <div className="card overflow-hidden" style={{ height: '72vh', display: 'flex' }}>

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <div className="flex-shrink-0 border-r flex flex-col" style={{ width: '260px', borderColor: 'var(--apple-border)' }}>
            <div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: 'var(--apple-border)', color: 'var(--apple-mid)' }}>
              Conversations
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-sm" style={{ color: 'var(--apple-mid)' }}>
                  <div className="text-3xl mb-2">💬</div>
                  No conversations yet
                </div>
              ) : conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className="w-full text-left p-4 flex items-center gap-3 border-b transition-colors"
                  style={{
                    borderColor: 'var(--apple-border)',
                    background: conv.id === selectedId ? 'rgba(0,113,227,0.08)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (conv.id !== selectedId) e.currentTarget.style.background = 'var(--apple-gray)'; }}
                  onMouseLeave={e => { if (conv.id !== selectedId) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                    style={{ background: `hsl(${(conv.otherUserId * 83) % 360}, 55%, 55%)` }}
                  >
                    {conv.otherUserEmail.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--apple-dark)' }}>
                      {conv.otherUserEmail.split('@')[0]}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--apple-mid)' }}>
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Chat area ───────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            {!selectedId ? (
              <div className="flex-1 flex flex-col items-center justify-center" style={{ color: 'var(--apple-mid)' }}>
                <div className="text-5xl mb-3">💬</div>
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose someone to chat with from the left</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b flex items-center gap-3" style={{ borderColor: 'var(--apple-border)' }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ background: `hsl(${((selectedConv?.otherUserId || 1) * 83) % 360}, 55%, 55%)` }}
                  >
                    {otherInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--apple-dark)' }}>{otherName}</p>
                    {selectedConv?.listingId && (
                      <p className="text-xs" style={{ color: 'var(--apple-mid)' }}>Re: Listing #{selectedConv.listingId}</p>
                    )}
                  </div>
                </div>

                {/* Messages list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {error && (
                    <p className="text-center text-sm" style={{ color: 'var(--apple-red)' }}>{error}</p>
                  )}

                  {messages.map(msg => {
                    // Compare by email — avoids async timing issues with numeric IDs
                    const isMe = myEmail !== '' && msg.senderEmail === myEmail;

                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>

                        {/* Other person's avatar — only on their side */}
                        {!isMe && (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ background: `hsl(${((selectedConv?.otherUserId || 1) * 83) % 360}, 55%, 55%)` }}
                          >
                            {otherInitials}
                          </div>
                        )}

                        <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div
                            className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                            style={{
                              background:            isMe ? 'var(--apple-blue)' : '#e9e9eb',
                              color:                 isMe ? '#fff' : 'var(--apple-dark)',
                              borderBottomRightRadius: isMe ? '4px' : '18px',
                              borderBottomLeftRadius:  isMe ? '18px' : '4px',
                            }}
                          >
                            {msg.content}
                          </div>
                          <p
                            className={`text-xs px-1 ${isMe ? 'text-right' : 'text-left'}`}
                            style={{ color: 'var(--apple-mid)' }}
                          >
                            {new Date(msg.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* My avatar — only on my side */}
                        {isMe && (
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ background: 'var(--apple-blue)' }}
                          >
                            {myEmail.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input bar */}
                <form onSubmit={handleSend} className="px-4 py-3 border-t flex gap-2" style={{ borderColor: 'var(--apple-border)' }}>
                  <input
                    className="input flex-1 py-2.5 text-sm"
                    placeholder="Type a message…"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2.5"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? '…' : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}