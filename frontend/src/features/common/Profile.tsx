import React, { useState } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/services/api';
import { User, Phone, BookOpen, Save, Award, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    department: user?.department || '',
    graduationYear: user?.graduationYear || '',
    cgpa: user?.cgpa !== undefined ? String(user.cgpa) : '',
    activeBacklogs: user?.activeBacklogs !== undefined ? String(user.activeBacklogs) : '0',
    company: user?.company || '',
    skillsInput: user?.skills?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setIsError(false);

    try {
      const skills = formData.skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.put('/auth/profile', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        department: formData.department.trim(),
        graduationYear: formData.graduationYear ? parseInt(String(formData.graduationYear), 10) : undefined,
        cgpa: formData.cgpa !== '' ? parseFloat(String(formData.cgpa)) : undefined,
        activeBacklogs: formData.activeBacklogs !== '' ? parseInt(String(formData.activeBacklogs), 10) : 0,
        company: formData.company.trim() || undefined,
        skills,
      });

      updateUser(res.data.data);
      setMsg('Profile credentials and eligibility parameters saved.');
    } catch (err: any) {
      setIsError(true);
      setMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl bg-tideglass-surface border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] p-6 sm:p-10 shadow-[0_4px_16px_rgba(30,45,39,0.06)] backdrop-blur-[6px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#D4DED3]">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-[#EAF5EF] text-[#0A7D6E] border border-[#BDE0D3] mb-2">
              <Award className="w-3.5 h-3.5 text-[#0A7D6E]" />
              Career profile &amp; academic credentials
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2D27] font-headline">
              Profile &amp; Eligibility Settings
            </h1>
            <p className="text-xs sm:text-sm text-[#516861] mt-1">
              Keep your academic standing, CGPA, and technical skills updated for automated campus drive matching.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#EAF5EF] border border-emerald-200 text-xs font-mono text-[#066A5B] self-start sm:self-auto">
            Role: <strong className="uppercase text-[#0A7D6E]">{user?.role?.replace('_', ' ')}</strong>
          </div>
        </div>

        {msg && (
          <div
            role="alert"
            className={`mb-6 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              !isError
                ? 'bg-[#E6F4F0] border border-emerald-400/40 text-[#066A5B]'
                : 'bg-[#FEE2E2] border border-red-400/40 text-[#991B1B]'
            }`}
          >
            {!isError ? (
              <CheckCircle2 className="w-4 h-4 text-[#0A7D6E] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />
            )}
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="label">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#516861] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-phone" className="label">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#516861] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="profile-phone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="input pl-10"
                />
              </div>
            </div>
          </div>

          {user?.role === 'student' ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="profile-department" className="label">Academic Department</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-[#516861] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="profile-department"
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Computer Science & Engineering"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-grad-year" className="label">Graduation Year</label>
                <input
                  id="profile-grad-year"
                  type="number"
                  name="graduationYear"
                  min={2020}
                  max={2032}
                  value={formData.graduationYear}
                  onChange={handleChange}
                  placeholder="2026"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="profile-cgpa" className="label">Cumulative CGPA</label>
                <input
                  id="profile-cgpa"
                  type="number"
                  step="0.01"
                  min={0}
                  max={10}
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="8.50"
                  className="input"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-company" className="label">Organization / Company</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#516861] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="profile-company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Enterprise Organization"
                    className="input pl-10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="profile-dept-other" className="label">Division / Department</label>
                <input
                  id="profile-dept-other"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="University Talent Acquisition"
                  className="input"
                />
              </div>
            </div>
          )}

          {user?.role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-backlogs" className="label">Active Academic Backlogs</label>
                <input
                  id="profile-backlogs"
                  type="number"
                  min={0}
                  max={20}
                  name="activeBacklogs"
                  value={formData.activeBacklogs}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="profile-skills" className="label">Verified Technical Skills (Comma-separated)</label>
                <input
                  id="profile-skills"
                  type="text"
                  name="skillsInput"
                  value={formData.skillsInput}
                  onChange={handleChange}
                  placeholder="React, TypeScript, Node.js, Python, SQL"
                  className="input"
                />
              </div>
            </div>
          )}

          {user?.role !== 'student' && (
            <div>
              <label htmlFor="profile-skills-other" className="label">Focus Areas / Domains (Comma-separated)</label>
              <input
                id="profile-skills-other"
                type="text"
                name="skillsInput"
                value={formData.skillsInput}
                onChange={handleChange}
                placeholder="Cloud Architecture, Full-Stack Engineering, Data Science"
                className="input"
              />
            </div>
          )}

          <div>
            <label htmlFor="profile-bio" className="label">Professional Summary &amp; Career Objective</label>
            <textarea
              id="profile-bio"
              rows={3}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Summarize your engineering focus, key achievements, or recruitment priorities..."
              className="input resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={saving}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              <span>{saving ? 'Saving Credentials...' : 'Save Profile Changes'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Profile;
