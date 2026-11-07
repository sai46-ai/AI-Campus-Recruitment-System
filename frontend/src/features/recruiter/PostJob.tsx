import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../shared/services/api';
import { Briefcase, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';

export const PostJob: React.FC = () => {
  const { jobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();
  const isEditing = !!jobId;

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [location, setLocation] = useState('Remote');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [jobType, setJobType] = useState<'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Remote'>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level (0-2 Yrs)');
  const [department, setDepartment] = useState('Computer Science & IT');
  const [deadline, setDeadline] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [allowedBranchesInput, setAllowedBranchesInput] = useState('');
  const [maxBacklogs, setMaxBacklogs] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEditing && jobId) {
      fetchJobDetails(jobId);
    }
  }, [jobId]);

  const fetchJobDetails = async (id: string) => {
    setFetching(true);
    try {
      const res = await api.get(`/jobs/${id}`);
      const job = res.data.data;
      setTitle(job.title || '');
      setCompany(job.company || '');
      setDescription(job.description || '');
      setRequiredSkillsInput(job.requiredSkills?.join(', ') || '');
      setLocation(job.location || 'Remote');
      setMinSalary(job.salary?.min ? String(job.salary.min) : '');
      setMaxSalary(job.salary?.max ? String(job.salary.max) : '');
      setCurrency(job.salary?.currency || 'INR');
      setJobType(job.jobType || 'Full-time');
      setExperienceLevel(job.experienceLevel || 'Entry Level (0-2 Yrs)');
      setDepartment(job.department || 'Computer Science & IT');
      setDeadline(job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '');
      setMinCgpa(job.minCgpa !== undefined && job.minCgpa !== null ? String(job.minCgpa) : '');
      setAllowedBranchesInput(job.allowedBranches ? job.allowedBranches.join(', ') : '');
      setMaxBacklogs(job.maxBacklogs !== undefined && job.maxBacklogs !== null ? String(job.maxBacklogs) : '');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to load job drive details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !description || !requiredSkillsInput) {
      setMessage('Please fill in all required fields (Title, Company, Description, Skills)');
      return;
    }

    setLoading(true);
    setMessage('');

    const skillsArray = requiredSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      title,
      company,
      description,
      requiredSkills: skillsArray,
      location,
      salary: {
        min: minSalary ? Number(minSalary) : undefined,
        max: maxSalary ? Number(maxSalary) : undefined,
        currency,
      },
      jobType,
      experienceLevel,
      department,
      minCgpa: minCgpa ? Number(minCgpa) : 0,
      allowedBranches: allowedBranchesInput
        ? allowedBranchesInput.split(',').map((b) => b.trim()).filter(Boolean)
        : [],
      maxBacklogs: maxBacklogs ? Number(maxBacklogs) : 0,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
    };

    try {
      if (isEditing && jobId) {
        await api.put(`/jobs/${jobId}`, payload);
        setMessage('Job drive updated successfully');
      } else {
        await api.post('/jobs', payload);
        setMessage('Campus recruitment drive posted successfully');
      }
      setTimeout(() => {
        navigate('/my-jobs');
      }, 900);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to save job drive');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-[#D4DED3] bg-tideglass-surface text-xs font-semibold text-[#1E2D27] hover:bg-[#EAF2ED] hover:border-[#0A7D6E]/40 transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4 text-[#0A7D6E]" />
        <span>Back to Dashboard</span>
      </button>

      <div className="rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] p-6 sm:p-10 shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
        <div className="flex items-center space-x-3.5 mb-8 pb-5 border-b border-[#D4DED3]">
          <div className="w-10 h-10 rounded-xl bg-[#EAF5EF] border border-[#BDE0D3] flex items-center justify-center text-[#0A7D6E] shadow-xs">
            <Briefcase className="w-5 h-5 text-[#0A7D6E]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E2D27] font-headline">
              {isEditing ? 'Edit Campus Recruitment Drive' : 'Post New Campus Recruitment Drive'}
            </h1>
            <p className="text-xs text-[#516861]">
              Configure role requirements, compensation range, and academic eligibility cutoffs.
            </p>
          </div>
        </div>

        {message && (
          <div
            role="alert"
            className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              !message.toLowerCase().includes('failed')
                ? 'bg-[#E6F4F0] border border-emerald-400/40 text-[#066A5B]'
                : 'bg-[#FEE2E2] border border-red-400/40 text-[#991B1B]'
            }`}
          >
            {!message.toLowerCase().includes('failed') ? (
              <CheckCircle2 className="w-4 h-4 text-[#0A7D6E] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Job Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Associate Software Engineer"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Company Name *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Enterprise Systems Corp"
                required
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="label">Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru / Hybrid"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as any)}
                className="input"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="label">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="input"
              >
                <option value="Entry Level (0-2 Yrs)">Entry Level (0-2 Yrs)</option>
                <option value="Mid Level (2-5 Yrs)">Mid Level (2-5 Yrs)</option>
                <option value="Senior Level (5+ Yrs)">Senior Level (5+ Yrs)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="label">Min Salary (Annual INR)</label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="e.g. 800000"
                className="input"
              />
            </div>

            <div>
              <label className="label">Max Salary (Annual INR)</label>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="e.g. 1400000"
                className="input"
              />
            </div>

            <div>
              <label className="label">Application Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Academic Eligibility Controls */}
          <div className="p-5 rounded-2xl bg-[#FFFBEB]/50 border border-amber-200/80 border-t-2 border-t-[#D97706] space-y-4">
            <h4 className="text-xs font-mono font-bold text-[#92400E] uppercase tracking-wider">
              Academic Eligibility Gates (Enforced at Application Time)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Minimum CGPA (0 - 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  placeholder="e.g. 7.5 (0 for none)"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Allowed Branches (Comma-separated)</label>
                <input
                  type="text"
                  value={allowedBranchesInput}
                  onChange={(e) => setAllowedBranchesInput(e.target.value)}
                  placeholder="e.g. CSE, IT, ECE (Empty = All)"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Max Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  placeholder="e.g. 0"
                  className="input"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Required Technical Skills (Comma-separated) *</label>
            <input
              type="text"
              value={requiredSkillsInput}
              onChange={(e) => setRequiredSkillsInput(e.target.value)}
              placeholder="e.g. React, TypeScript, Node.js, MongoDB, REST API"
              required
              className="input"
            />
            <span className="text-xs text-[#516861] mt-1 block">
              Candidate resumes and skill profiles are automatically scored against these required competencies.
            </span>
          </div>

          <div>
            <label className="label">Full Job Description &amp; Selection Process *</label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role responsibilities, key qualifications, selection stages, and technical expectations..."
              required
              className="input resize-none"
            />
          </div>

          <div className="pt-4 border-t border-[#D4DED3] flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              isLoading={loading}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>{isEditing ? 'Save Drive Changes' : 'Publish Campus Drive'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
