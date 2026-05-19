import { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';

export default function NotificationPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationsAPI.getMy({ limit: 50 });
      const payload = res.data?.data;
      setItems(payload?.notifications || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  const markAll = async () => {
    try {
      await notificationsAPI.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <div style={{ color: 'rgba(255,255,255,0.7)' }}>Loading notifications…</div>;
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 18
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h3 style={{ margin: 0, color: '#fff' }}>Notifications</h3>
        <button
          type="button"
          onClick={markAll}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Mark all read
        </button>
      </div>

      {error ? (
        <div style={{ marginTop: 10, color: '#f87171' }}>{error}</div>
      ) : null}

      {items.length === 0 ? (
        <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.65)' }}>No notifications yet.</div>
      ) : (
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {items.map((n) => (
            <div
              key={n._id}
              style={{
                padding: 12,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(168,85,247,0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ color: '#fff', fontWeight: 600 }}>
                  {n.title || 'Update'}
                </div>
                {!n.read ? (
                  <button
                    type="button"
                    onClick={() => markRead(n._id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
              <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.75)' }}>{n.message}</div>
              <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
