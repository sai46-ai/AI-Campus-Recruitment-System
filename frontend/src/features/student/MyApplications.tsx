import React, { useEffect, useState } from 'react';
import { api } from '../../shared/services/api';
import { Application } from '../../shared/types';
import { Briefcase, Compass, Award, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Modal } from '../../shared/components/ui/Modal';

const statusVariants: Record<string, 'default' | 'blue' | 'amber' | 'emerald' | 'coral' | 'teal' | 'cyan'> = {
  Applied: 'blue',
  'Under Review': 'amber',
  Shortlisted: 'emerald',
  Rejected: 'coral',
  Selected: 'teal',
  Hired: 'emerald',
  Withdrawn: 'default',
};

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [withdrawModal, setWithdrawModal] = useState<{ open: boolean; appId: string }>({
    open: false,
    appId: '',
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications/my-applications');
      setApplications(res.data.data || []);
      setLoadError('');
    } catch (error: any) {
      setLoadError(error.response?.data?.message || 'Could not load applications. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRequest = (appId: string) => {
    setWithdrawModal({ open: true, appId });
  };

  const handleWithdrawConfirm = async () => {
    if (!withdrawModal.appId) return;
    try {
      await api.delete(`/applications/${withdrawModal.appId}`);
      setApplications((prev) =>
        prev.map((a) => (a._id === withdrawModal.appId ? { ...a, status: 'Withdrawn' as any } : a))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw application');
    }
    setWithdrawModal({ open: false, appId: '' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8 p-6 sm:p-8 rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#2563EB] backdrop-blur-[6px] shadow-[0_4px_16px_rgba(30,45,39,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-[#EFF6FF] border border-blue-200 text-[11px] font-mono font-medium text-[#1D4ED8] mb-3">
            <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Application Tracking Console</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1E2D27] font-headline">My Campus Applications</h1>
          <p className="text-sm text-[#516861] mt-1">
            Track your submitted campus drive applications, ATS match scores, and stage progression history.
          </p>
        </div>
        <Button variant="primary" asChild>
          <Link to="/jobs">Explore More Drives</Link>
        </Button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse bg-tideglass-surface border border-[#D4DED3]">
              <div className="h-4 w-3/4 bg-[#D8E6E1] rounded mb-4" />
              <div className="h-3 w-1/2 bg-[#D8E6E1] rounded mb-4" />
              <div className="h-16 bg-[#D8E6E1] rounded mb-4" />
            </Card>
          ))}
        </div>
      ) : loadError ? (
        <Card className="p-8 bg-tideglass-surface border border-red-400/40" role="alert">
          <p className="body-text text-[#991B1B]">{loadError}</p>
          <Button variant="outline" className="mt-4" onClick={fetchApplications}>
            Try again
          </Button>
        </Card>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app._id} className="p-6 bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px] rounded-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1.5 flex-wrap">
                    <h3 className="text-lg font-bold text-[#1E2D27] font-headline">
                      {app.job?.title || 'Position'}
                    </h3>
                    <Badge
                      variant={statusVariants[app.status] || 'default'}
                      size="sm"
                    >
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-[#2563EB]">
                    {app.job?.company} • {app.job?.location || 'Campus'}
                  </p>

                  <section className="mt-4 pt-3 border-t border-[#D4DED3]" aria-label="Application status history">
                    <h4 className="text-xs font-mono text-[#516861] font-medium mb-2.5">
                      Stage progression timeline
                    </h4>
                    {app.timeline?.length ? (
                      <ol className="border-l-2 border-[#0A7D6E]/40 pl-4 space-y-2.5">
                        {app.timeline.map((event, index) => (
                          <li key={`${event.updatedAt}-${index}`} className="relative">
                            <span
                              className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#0A7D6E]"
                              aria-hidden="true"
                            />
                            <p className="text-xs font-semibold text-[#1E2D27]">{event.status}</p>
                            <p className="text-[11px] font-mono text-[#516861]">
                              {new Date(event.updatedAt).toLocaleString()}
                            </p>
                            {event.comment && (
                              <p className="text-xs text-[#516861] mt-0.5">{event.comment}</p>
                            )}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-xs text-[#516861]">
                        Submitted on {new Date(app.appliedAt).toLocaleDateString()} — awaiting initial screening.
                      </p>
                    )}
                    <p className="sr-only" aria-live="polite">
                      Current application status: {app.status}
                    </p>
                  </section>

                  {app.aiAnalysis?.matchedSkills && app.aiAnalysis.matchedSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {app.aiAnalysis.matchedSkills.map((sk: string, idx: number) => (
                        <Badge key={idx} variant="cyan" size="sm" className="inline-flex items-center">
                          <Check className="w-3 h-3 mr-1 shrink-0" aria-hidden="true" />
                          <span>{sk}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 border-t md:border-t-0 pt-4 md:pt-0 border-[#D4DED3] w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm font-semibold text-[#0A7D6E] font-mono tabular-nums">
                      <Award className="w-4 h-4 shrink-0 text-[#0A7D6E]" aria-hidden="true" />
                      <span>{app.matchScore || 0}% ATS Match</span>
                    </div>
                    <p className="text-xs text-[#516861] mt-0.5">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {app.status === 'Applied' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleWithdrawRequest(app._id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-tideglass-surface border border-[#D4DED3]">
          <Briefcase className="w-14 h-14 text-[#2879AD] mx-auto mb-4" aria-hidden="true" />
          <h2 className="heading-3 mb-2">No job applications submitted yet</h2>
          <p className="body-text text-[#516861] mb-6">
            Explore published campus recruitment drives and submit your first application.
          </p>
          <Button variant="primary" asChild>
            <Link to="/jobs">Browse Active Drives</Link>
          </Button>
        </Card>
      )}

      <Modal
        isOpen={withdrawModal.open}
        onClose={() => setWithdrawModal({ open: false, appId: '' })}
        title="Withdraw Application"
        size="sm"
      >
        <p className="text-sm text-[#344942] mb-6">
          Are you sure you want to withdraw this job application? You can re-apply later if the drive remains open.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setWithdrawModal({ open: false, appId: '' })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleWithdrawConfirm}>
            Confirm Withdraw
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default MyApplications;