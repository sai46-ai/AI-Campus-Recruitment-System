import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/services/api';
import { Mail, Lock, LogIn, Shield } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { AuthSecurityShield } from '../../shared/components/security/AuthSecurityShield';

interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (formError) setFormError('');
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (formError) setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    const errors: LoginFieldErrors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('');
      return;
    }

    setFieldErrors({});
    setFormError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const { user, accessToken } = res.data.data;
      login(user, accessToken);

      if (user.role === 'recruiter') navigate('/recruiter-dashboard');
      else if (user.role === 'placement_officer') navigate('/placement-dashboard');
      else if (user.role === 'admin' || user.role === 'super_admin') navigate('/admin-dashboard');
      else navigate('/student-dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;

      if (status === 401) {
        setFormError('Invalid email or password.');
      } else if (status === 403) {
        setFormError('Security verification failed. Please refresh and try again.');
      } else if (!err.response || err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        setFormError('Unable to connect to the server. Please check your connection and try again.');
      } else if (status >= 500) {
        setFormError('The service is temporarily unavailable. Please try again later.');
      } else {
        setFormError(serverMsg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center relative z-10 bg-transparent">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Talent Network Core 3D Environment Zone */}
        <div className="lg:col-span-6 xl:col-span-5 max-w-lg space-y-5 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A7D6E]/20 border border-[#0A7D6E]/40 text-[#5EEAD4] text-xs font-mono font-medium backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5 text-[#5EEAD4]" />
            <span>Institutional Recruitment Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-white font-headline leading-[1.15] drop-shadow-sm">
            Enterprise Campus Recruitment &amp; Placement Network
          </h1>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-md leading-relaxed">
            Access your verified institutional workspace to manage campus drives, review automated ATS candidate rankings, and coordinate placement operations.
          </p>
          <div className="hidden sm:grid grid-cols-2 gap-3.5 pt-2 max-w-md">
            <div className="p-3.5 rounded-xl border border-[#1E3A52] border-t-2 border-t-[#2563EB] bg-[#0E2233]/85 backdrop-blur-[6px] shadow-sm">
              <p className="text-xs font-semibold text-white">Candidates &amp; Students</p>
              <p className="text-[11px] text-[#94A3B8] mt-1 leading-normal">Explore active drives, track submissions, and build ATS resumes.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-[#1E3A52] border-t-2 border-t-[#0A7D6E] bg-[#0E2233]/85 backdrop-blur-[6px] shadow-sm">
              <p className="text-xs font-semibold text-white">Recruiters &amp; Placement</p>
              <p className="text-[11px] text-[#94A3B8] mt-1 leading-normal">Publish opportunities, verify applicants, and manage recruitment funnels.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-6 xl:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_12px_40px_rgba(0,0,0,0.30)] bg-[#FFFDF7]/95 backdrop-blur-[8px] p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E2D27] font-headline">Sign In to Your Workspace</h2>
              <p className="text-xs text-[#516861] mt-1">
                Enter your institutional credentials to continue
              </p>
            </div>

            {formError && (
              <div
                className="p-3 rounded-xl bg-[#FEE2E2] text-[#991B1B] border border-red-400/40 text-xs font-medium mb-5"
                role="alert"
                aria-live="assertive"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Institutional Email"
                type="email"
                required
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="user@university.edu"
                icon={<Mail className="w-4 h-4 text-[#516861]" aria-hidden="true" />}
                error={fieldErrors.email}
                autoComplete="email"
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4 text-[#516861]" aria-hidden="true" />}
                error={fieldErrors.password}
                autoComplete="current-password"
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full py-2.5 mt-2 bg-[#0A7D6E] hover:bg-[#066A5B] text-white font-semibold rounded-xl"
                isLoading={loading}
                disabled={loading}
              >
                <LogIn className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Sign In
              </Button>
            </form>

            <p className="text-center text-xs text-[#516861] mt-5 pt-4 border-t border-[#D4DED3]">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-[#0A7D6E] font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
