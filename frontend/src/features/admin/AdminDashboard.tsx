import React, { useEffect, useState } from 'react';
import { api } from '../../shared/services/api';
import { StatCard } from '../../shared/components/widgets/StatCard';
import { User } from '../../shared/types';
import { Users, Briefcase, UserCheck } from 'lucide-react';

interface AuditLogItem {
  _id: string;
  actorEmail?: string;
  action: string;
  targetResource: string;
  details?: Record<string, any>;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, logsRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.data.users || []);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value.data.data || []);
    } catch {
      // Preserve UI state
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRecruiter = async (userId: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/verify`);
      const verifiedRecruiter = res.data.data;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId || (u as any)._id === userId
            ? { ...u, isRecruiterVerified: verifiedRecruiter.isRecruiterVerified }
            : u
        )
      );
      setActionMsg('Recruiter account verified successfully');
    } catch (err: any) {
      setActionMsg(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      const updated = res.data.data;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId || (u as any)._id === userId
            ? ({ ...u, isActive: updated.isActive } as any)
            : u
        )
      );
      setActionMsg(`User account status updated to ${updated.isActive ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      setActionMsg(err.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0A7D6E]" />
            <span className="text-[11px] font-mono font-medium text-[#0A7D6E]">
              Institutional Governance Console
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E2D27] font-headline mt-1">
            System Administration &amp; RBAC Console
          </h1>
          <p className="text-xs text-[#516861] font-mono mt-0.5">
            Role-Based Access Control | Recruiter Verification | Institutional Audit Ledger
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#F0F6F3]/80 border border-[#D4DED3] text-xs font-mono text-[#1E6778]">
            Audit trail: Active
          </span>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`mb-6 p-3.5 rounded-xl text-xs font-semibold ${
            !actionMsg.toLowerCase().includes('failed')
              ? 'bg-[#E6F4F0] border border-emerald-400/40 text-[#066A5B]'
              : 'bg-[#FEE2E2] border border-red-400/40 text-[#991B1B]'
          }`}
        >
          {actionMsg}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} variant="blue" />
            <StatCard title="Students" value={stats?.totalStudents || 0} icon={Users} variant="cyan" />
            <StatCard title="Recruiters" value={stats?.totalRecruiters || 0} icon={Briefcase} variant="teal" />
            <StatCard
              title="Pending Verifications"
              value={stats?.pendingRecruiterVerifications || 0}
              icon={UserCheck}
              variant="amber"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#D4DED3] space-x-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 text-sm font-bold transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-[#0A7D6E] text-[#0A7D6E]'
                  : 'text-[#516861] hover:text-[#1E2D27]'
              }`}
            >
              User Accounts ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 text-sm font-bold transition-colors ${
                activeTab === 'audit'
                  ? 'border-b-2 border-[#0A7D6E] text-[#0A7D6E]'
                  : 'text-[#516861] hover:text-[#1E2D27]'
              }`}
            >
              Audit Logs ({auditLogs.length})
            </button>
          </div>

          {activeTab === 'users' ? (
            <div className="p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
              <h2 className="text-lg font-bold text-[#1E2D27] mb-4 font-headline">
                User Accounts Management
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E2D27]">
                  <thead className="bg-[#F0F6F3]/80 text-[#1E2D27] font-semibold font-mono text-[11px]">
                    <tr>
                      <th className="p-3 rounded-tl-xl">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Email Verified</th>
                      <th className="p-3">Recruiter Verified</th>
                      <th className="p-3">Account Status</th>
                      <th className="p-3 rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4DED3]">
                    {users.map((u: any) => {
                      const roleBadgeClass =
                        u.role === 'admin'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : u.role === 'recruiter'
                          ? 'bg-[#EAF5EF] text-[#0A7D6E] border border-emerald-200'
                          : u.role === 'placement_officer'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-[#EFF6FF] text-[#1D4ED8] border border-blue-200';

                      return (
                        <tr key={u._id || u.id} className="hover:bg-[#F0F6F3]/70 transition-colors">
                          <td className="p-3 font-semibold text-[#1E2D27]">
                            {u.name}
                            <br />
                            <span className="text-[11px] text-[#516861] font-normal">{u.email}</span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize ${roleBadgeClass}`}>
                              {u.role?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-medium">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                u.isVerified
                                  ? 'bg-emerald-500/15 text-[#066A5B] border border-emerald-400/30'
                                  : 'bg-amber-500/15 text-[#92400E] border border-amber-400/30'
                              }`}
                            >
                              {u.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-3 font-medium">
                            {u.role === 'recruiter' ? (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  u.isRecruiterVerified
                                    ? 'bg-emerald-500/15 text-[#066A5B] border border-emerald-400/30'
                                    : 'bg-amber-500/15 text-[#92400E] border border-amber-400/30'
                                }`}
                              >
                                {u.isRecruiterVerified ? 'Verified' : 'Unverified'}
                              </span>
                            ) : (
                              <span className="text-[#6D858A] text-[10px]">N/A</span>
                            )}
                          </td>
                          <td className="p-3 font-medium">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                u.isActive !== false
                                  ? 'bg-emerald-500/15 text-[#066A5B] border border-emerald-400/30'
                                  : 'bg-red-500/15 text-[#991B1B] border border-red-400/30'
                              }`}
                            >
                              {u.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-3 space-x-2">
                            {!u.isRecruiterVerified && u.role === 'recruiter' && (
                              <button
                                onClick={() => handleVerifyRecruiter(u._id || u.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#0A7D6E] text-white hover:bg-[#0E9584] text-[10px] font-bold transition-all"
                              >
                                Verify Recruiter
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleStatus(u._id || u.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#F0F6F3] border border-[#D4DED3] text-[#1E2D27] hover:bg-[#EAF2ED] text-[10px] font-bold transition-all"
                            >
                              {u.isActive !== false ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#2563EB] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
              <h2 className="text-lg font-bold text-[#1E2D27] mb-4 font-headline">System Audit Trail</h2>
              {auditLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#1E2D27]">
                    <thead className="bg-[#F0F6F3]/80 text-[#1E2D27] font-semibold font-mono text-[11px]">
                      <tr>
                        <th className="p-3 rounded-tl-xl">Timestamp</th>
                        <th className="p-3">Actor</th>
                        <th className="p-3">Action</th>
                        <th className="p-3 rounded-tr-xl">Target Resource</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4DED3]">
                      {auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-[#E6F4F0]/70">
                          <td className="p-3 text-[#516861] font-mono">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3 font-semibold text-[#1E2D27]">{log.actorEmail || 'System'}</td>
                          <td className="p-3 font-bold text-[#0A7D6E] font-mono">{log.action}</td>
                          <td className="p-3 text-[#1E2D27]">{log.targetResource}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[#516861] py-8 text-center">
                  No audit log records recorded yet.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
