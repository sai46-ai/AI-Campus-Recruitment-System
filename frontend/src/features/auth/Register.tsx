import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../shared/services/api';
import { Mail, Lock, User, BookOpen, Building2, Shield, CheckCircle2, Award } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { AuthSecurityShield } from '../../shared/components/security/AuthSecurityShield';

interface RegisterFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  otpCode?: string;
}

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    department: '',
    graduationYear: '',
    cgpa: '',
    activeBacklogs: '0',
    company: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'student' || r === 'recruiter') {
      setFormData((prev) => ({ ...prev, role: r }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof RegisterFieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) setError('');
  };

  const handleOtpChange = (val: string) => {
    setOtpCode(val);
    if (fieldErrors.otpCode) {
      setFieldErrors((prev) => ({ ...prev, otpCode: undefined }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const errors: RegisterFieldErrors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('');
      return;
    }

    setFieldErrors({});
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        department: formData.department || undefined,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : undefined,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        activeBacklogs: formData.activeBacklogs ? parseInt(formData.activeBacklogs, 10) : 0,
        company: formData.company || undefined,
        phone: formData.phone || undefined,
      };
      await api.post('/auth/register', payload);
      setVerificationPending(true);
      setSuccess('Account created. Enter the six-digit verification code sent to your email.');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!otpCode.trim()) {
      setFieldErrors({ otpCode: 'Verification code is required.' });
      return;
    }
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setFieldErrors({ otpCode: 'Please enter a valid 6-digit verification code.' });
      return;
    }

    setFieldErrors({});
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: formData.email, otpCode });
      setVerificationComplete(true);
      setVerificationPending(false);
      setSuccess('Email verified. You can now sign in.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Check the code and try again.');
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
            <span>Institutional Registration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-white font-headline leading-[1.15] drop-shadow-sm">
            Build Your Academic &amp; Career Gateway
          </h1>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-md leading-relaxed">
            Register as an accredited student candidate or verified enterprise recruiter to participate in campus recruitment drives and structured hiring workflows.
          </p>
          <div className="hidden sm:grid grid-cols-2 gap-3.5 pt-2 max-w-md">
            <div className="p-3.5 rounded-xl border border-[#1E3A52] border-t-2 border-t-[#2563EB] bg-[#0E2233]/85 backdrop-blur-[6px] shadow-sm">
              <p className="text-xs font-semibold text-white">Direct Campus Drives</p>
              <p className="text-[11px] text-[#94A3B8] mt-1 leading-normal">Explore curated employer postings with verified eligibility criteria.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-[#1E3A52] border-t-2 border-t-[#0A7D6E] bg-[#0E2233]/85 backdrop-blur-[6px] shadow-sm">
              <p className="text-xs font-semibold text-white">Automated ATS Scoring</p>
              <p className="text-[11px] text-[#94A3B8] mt-1 leading-normal">Upload or build structured resumes with instant keyword matching.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Card */}
        <div className="lg:col-span-6 xl:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-lg rounded-2xl border border-[#D4DED3] border-t-2 border-t-[#0A7D6E] shadow-[0_12px_40px_rgba(0,0,0,0.30)] bg-[#FFFDF7]/95 backdrop-blur-[8px] p-6 sm:p-8">
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E2D27] font-headline">Create Your Account</h2>
              <p className="text-xs text-[#516861] mt-0.5">
                Join the campus recruitment network
              </p>
            </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FEE2E2] text-[#991B1B] border border-red-400/40 text-sm font-medium mb-6" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3.5 rounded-xl bg-[#E6F4F0] text-[#066A5B] border border-emerald-400/40 text-sm font-medium mb-6" role="status">
              {success}
            </div>
          )}

          {verificationPending ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
              <p className="text-sm text-[#1E2D27]">Enter the verification code sent to <strong>{formData.email}</strong>.</p>
              <Input
                label="Six-digit verification code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(e) => handleOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                minLength={6}
                maxLength={6}
                required
                error={fieldErrors.otpCode}
                disabled={loading}
              />
              <Button type="submit" variant="primary" size="lg" className="w-full py-3.5" isLoading={loading} disabled={loading || otpCode.length !== 6}>
                Verify Email
              </Button>
            </form>
          ) : verificationComplete ? (
            <div className="space-y-5">
              <p className="text-sm text-[#0A7D6E] font-semibold" role="status">{success}</p>
              <Button type="button" variant="primary" size="lg" className="w-full py-3.5" onClick={() => navigate('/login')}>
                Continue to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-mono font-medium text-[#1E2D27] mb-2">
                  I am registering as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['student', 'recruiter'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, role: r }))}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
                        formData.role === r
                          ? 'bg-[#EAF5EF] border-[#0A7D6E] text-[#0A7D6E] shadow-xs'
                          : 'bg-[#F0F6F3]/80 border-[#D4DED3] text-[#516861] hover:border-[#0A7D6E]/50 hover:text-[#1E2D27]'
                      }`}
                      aria-pressed={formData.role === r}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                name="name"
                label="Full Name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Student / HR Manager Name"
                icon={<User className="w-5 h-5" aria-hidden="true" />}
                autoComplete="name"
                error={fieldErrors.name}
                disabled={loading}
              />

              <Input
                name="email"
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="user@university.edu"
                icon={<Mail className="w-5 h-5" aria-hidden="true" />}
                autoComplete="email"
                error={fieldErrors.email}
                disabled={loading}
              />

              <Input
                name="password"
                label="Password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                icon={<Lock className="w-5 h-5" aria-hidden="true" />}
                autoComplete="new-password"
                error={fieldErrors.password}
                disabled={loading}
                helperText="At least 8 characters"
              />

              {formData.role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    name="department"
                    label="Department"
                    type="text"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="CSE / IT / ECE"
                    icon={<BookOpen className="w-5 h-5" aria-hidden="true" />}
                    disabled={loading}
                  />
                  <Input
                    name="graduationYear"
                    label="Graduation Batch"
                    type="number"
                    min={2020}
                    max={2032}
                    value={formData.graduationYear}
                    onChange={handleChange}
                    placeholder="2026"
                    disabled={loading}
                  />
                  <Input
                    name="cgpa"
                    label="Current CGPA"
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    value={formData.cgpa}
                    onChange={handleChange}
                    placeholder="8.5"
                    icon={<Award className="w-5 h-5" aria-hidden="true" />}
                    disabled={loading}
                  />
                </div>
              )}

              {formData.role === 'recruiter' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    name="company"
                    label="Company Name"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Enterprise Organization"
                    icon={<Building2 className="w-5 h-5" aria-hidden="true" />}
                    disabled={loading}
                  />
                  <Input
                    name="phone"
                    label="Company Phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    disabled={loading}
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full py-3.5 mt-2"
                isLoading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </form>
          )}

        <p className="text-center text-xs text-[#516861] mt-5 pt-4 border-t border-[#D4DED3]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0A7D6E] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
          </div>
        </div>
      </div>
    </div>
  );
};
