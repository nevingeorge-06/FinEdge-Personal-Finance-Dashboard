import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { authService } from '../../api/authService';
import { User } from '../../types/auth';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Field validation errors
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errs: { fullName?: string; email?: string; password?: string } = {};

    if (!isLogin && !fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await authService.login({ email: email.trim(), password });
        onAuthSuccess({
          email: response.email,
          fullName: response.fullName,
        });
      } else {
        const response = await authService.register({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        });
        setSuccessMessage('Account created successfully! Welcome to FinEdge.');
        setTimeout(() => {
          onAuthSuccess({
            email: response.email,
            fullName: response.fullName,
          });
        }, 600);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please check your network and credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('alex.morgan@finedge.io');
    setPassword('password123');
    setFullName('Alex Morgan');
    setErrors({});
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#F6F0E7', color: '#38271F' }}>
      {/* Background warmth accents */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'rgba(118,81,60,0.06)' }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'rgba(40,122,85,0.05)' }} />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-md" style={{ backgroundColor: 'rgba(118,81,60,0.10)', border: '1px solid rgba(118,81,60,0.25)' }}>
            <Shield className="w-8 h-8" style={{ fill: 'rgba(118,81,60,0.15)', stroke: '#76513C' }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#38271F' }}>
            FinEdge
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#78685B' }}>
            Smarter Spending, Better Living
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl p-6 sm:p-8 shadow-xl" style={{ backgroundColor: '#FFFDF8', border: '1px solid #D8C6B2' }}>
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl mb-6" style={{ backgroundColor: '#F6F0E7', border: '1px solid #D8C6B2' }}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrorMessage(null);
                setErrors({});
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'text-cream-50 shadow-sm'
                  : 'hover:text-mocha-700'
              }`}
              style={isLogin ? { backgroundColor: '#76513C', color: '#FFFDF8' } : { color: '#78685B' }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrorMessage(null);
                setErrors({});
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all`}
              style={!isLogin ? { backgroundColor: '#76513C', color: '#FFFDF8' } : { color: '#78685B' }}
            >
              Create Account
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-lg font-bold" style={{ color: '#38271F' }}>
              {isLogin ? 'Welcome back' : 'Get started with FinEdge'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#78685B' }}>
              {isLogin
                ? 'Enter your credentials to access your personal dashboard'
                : 'Enter your details to create your secure finance account'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg text-xs flex items-start gap-2.5 animate-in fade-in duration-200" style={{ backgroundColor: 'rgba(185,76,72,0.08)', border: '1px solid rgba(185,76,72,0.25)', color: '#B94C48' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#B94C48' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg text-xs flex items-start gap-2.5 animate-in fade-in duration-200" style={{ backgroundColor: 'rgba(40,122,85,0.08)', border: '1px solid rgba(40,122,85,0.25)', color: '#287A55' }}>
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#287A55' }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field (Registration only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#78685B' }}>
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#CBAF96' }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: '#F6F0E7',
                      border: errors.fullName ? '1px solid #B94C48' : '1px solid #D8C6B2',
                      color: '#38271F',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#76513C'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(118,81,60,0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.fullName ? '#B94C48' : '#D8C6B2'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] mt-1" style={{ color: '#B94C48' }}>{errors.fullName}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#78685B' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#CBAF96' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs focus:outline-none transition-colors"
                  style={{
                    backgroundColor: '#F6F0E7',
                    border: errors.email ? '1px solid #B94C48' : '1px solid #D8C6B2',
                    color: '#38271F',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#76513C'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(118,81,60,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? '#B94C48' : '#D8C6B2'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] mt-1" style={{ color: '#B94C48' }}>{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#78685B' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#CBAF96' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? 'Your password' : 'Min. 6 characters'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg text-xs focus:outline-none transition-colors"
                  style={{
                    backgroundColor: '#F6F0E7',
                    border: errors.password ? '1px solid #B94C48' : '1px solid #D8C6B2',
                    color: '#38271F',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#76513C'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(118,81,60,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? '#B94C48' : '#D8C6B2'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#CBAF96' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] mt-1" style={{ color: '#B94C48' }}>{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 mt-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#76513C', color: '#FFFDF8' }}
              onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5D3D2D'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#76513C'; }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-cream-50/30 border-t-cream-50 rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-5 pt-4 border-t" style={{ borderColor: '#D8C6B2' }}>
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ backgroundColor: 'rgba(118,81,60,0.06)', border: '1px solid #D8C6B2', color: '#78685B' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EADCCB'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(118,81,60,0.06)'; }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#76513C' }} />
              <span>Fill Demo Credentials</span>
            </button>
            <p className="text-center text-[11px] mt-2" style={{ color: '#CBAF96' }}>
              Demo: alex.morgan@finedge.io / password123
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] mt-6" style={{ color: '#CBAF96' }}>
          Secured with end-to-end encryption · BCrypt password hashing
        </p>
      </div>
    </div>
  );
};
