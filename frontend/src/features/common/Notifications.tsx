import React, { useEffect, useState } from 'react';
import { api } from '../../shared/services/api';
import { NotificationItem } from '../../shared/types';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch {
      // Preserve UI state
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF5EF] border border-[#BDE0D3] flex items-center justify-center text-[#0A7D6E]">
            <Bell className="w-5 h-5 text-[#0A7D6E]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E2D27] font-headline">Notifications Center</h1>
            <p className="text-xs text-[#516861]">Real-time updates on applications, drive approvals, and schedules</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#0A7D6E]" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-xl border transition-all backdrop-blur-[6px] shadow-[0_2px_8px_rgba(30,45,39,0.04)] ${
                n.read
                  ? 'border-l-4 border-l-slate-300 bg-[#FFFDF7]/85 border-[#D4DED3] text-[#516861]'
                  : 'border-l-4 border-l-[#0A7D6E] bg-tideglass-surface border-[#D4DED3] text-[#1E2D27]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1E2D27]">{n.title}</h4>
                  <p className="text-xs text-[#516861] mt-1 leading-relaxed">{n.message}</p>
                </div>
                <span className="text-[11px] font-mono text-[#516861] whitespace-nowrap ml-4">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl bg-tideglass-surface border border-[#D4DED3] backdrop-blur-[6px]">
          <p className="text-sm font-semibold text-[#1E2D27]">No notifications yet</p>
          <p className="text-xs text-[#516861] mt-1">
            Application status updates and campus drive alerts will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
export default Notifications;
