import { useState } from 'react';
import { Truck, Eye, EyeOff, AlertCircle, Check, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { COUNTRY_CODES } from '@/data/countryCodes';
// Facebook signup uses Firebase in useAuth; legacy OAuth removed





const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PASSWORD_RULES = [
{ label: 'At least 6 characters', test: (p) => p.length >= 6 },
{ label: 'Contains a number', test: (p) => /\d/.test(p) },
{ label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) }];


export function SignupPage({ onSwitchToLogin }) {
  const { signup, loginWithGoogle, loginWithFacebook } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Name checks
    if (!name.trim()) {
      setError('Full name is required');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (name.trim().length > 50) {
      setError('Name cannot exceed 50 characters');
      return;
    }

    // Email checks
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password checks — enforce ALL rules
    const failedRules = PASSWORD_RULES.filter((r) => !r.test(password));
    if (failedRules.length > 0) {
      setError(`Password: ${failedRules.map((r) => r.label.toLowerCase()).join(', ')}`);
      return;
    }

    // Phone — validate if provided
    let fullPhone;
    if (phone.trim()) {
      const raw = phone.replace(/[\s\-()]/g, '');
      const cleaned = raw.startsWith('+') ? raw : `${countryCode}${raw}`;
      if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
        setError('Please enter a valid phone number');
        return;
      }
      fullPhone = cleaned;
    }

    setLoading(true);
    try {
      await signup(name, email, password, fullPhone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setError('');
    setLoading(true);
    // Trigger loginWithGoogle instantly and synchronously to bypass browser popup blocker
    loginWithGoogle().catch((err) => {
      setError(err instanceof Error ? err.message : 'Google signup failed');
      setLoading(false);
    });
  };

  const handleFacebook = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithFacebook();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Facebook signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
            {/* ── Left branding panel ────────────────────── */}
            <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ background: 'repeating-linear-gradient(135deg, #2e9eeb 0 2px, transparent 2px 20px)' }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                            <Truck size={20} className="text-neutral-900" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white leading-tight">TransportOps</div>
                            <div className="text-xs text-neutral-500">Operations Portal</div>
                        </div>
                    </div>

                    <h1 className="text-5xl font-bold text-white leading-tight mb-6">
                        Start managing<br />
                        your fleet<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">today</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-md leading-relaxed">
                        Join hundreds of transporters who rely on TransportOps for seamless operations and real-time visibility.
                    </p>
                </div>

                <div className="relative z-10 space-y-3">
                    {['Real-time load & permit tracking', 'Automated payment processing', 'Fleet health monitoring'].map((item) =>
          <div key={item} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                <Check size={12} className="text-green-400" />
                            </div>
                            <span className="text-sm text-neutral-400">{item}</span>
                        </div>
          )}
                </div>
            </div>

            {/* ── Right signup form ───────────────────────── */}
            <div className="flex-1 flex items-center justify-center bg-neutral-50 p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center">
                            <Truck size={16} className="text-white" />
                        </div>
                        <span className="text-lg font-bold text-neutral-900">TransportOps</span>
                    </div>

                    <h2 className="text-2xl font-bold text-neutral-900 mb-1">Create your account</h2>
                    <p className="text-sm text-neutral-500 mb-8">Get started with a free Driver account</p>

                    {/* OAuth buttons */}
                    <div className="mb-6">
                        <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-all disabled:opacity-50 shadow-sm">
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-neutral-200" />
                        <span className="text-xs text-neutral-400 font-medium">or sign up with email</span>
                        <div className="flex-1 h-px bg-neutral-200" />
                    </div>

                    {/* Error */}
                    {error &&
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
          }

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="Rajesh Kumar"
              className="w-full px-4 py-2.5 text-sm border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 text-sm border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">Phone Number</label>
                            <div className="flex gap-2">
                                {/* Country code selector */}
                                <div className="relative">
                                    <button type="button" onClick={() => {setShowCountryDropdown(!showCountryDropdown);setCountrySearch('');}}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm border border-neutral-200 bg-white rounded-lg hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all min-w-[100px]">
                                        <span className="text-base leading-none">{COUNTRY_CODES.find((c) => c.code === countryCode)?.flag}</span>
                                        <span className="font-medium text-neutral-700">{countryCode}</span>
                                        <ChevronDown size={13} className="text-neutral-400 ml-auto" />
                                    </button>
                                    {showCountryDropdown &&
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 max-h-64 flex flex-col">
                                            <div className="sticky top-0 p-2 border-b border-neutral-100 bg-white rounded-t-xl">
                                                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-50 rounded-lg">
                                                    <Search size={13} className="text-neutral-400 shrink-0" />
                                                    <input type="text" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country…" autoFocus
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400" />
                                                </div>
                                            </div>
                                            <div className="overflow-y-auto flex-1">
                                                {COUNTRY_CODES.filter((c) => {
                        if (!countrySearch) return true;
                        const q = countrySearch.toLowerCase();
                        return c.label.toLowerCase().includes(q) || c.code.includes(q);
                      }).map((c) =>
                      <button key={c.code + c.label} type="button"
                      onClick={() => {setCountryCode(c.code);setShowCountryDropdown(false);setCountrySearch('');}}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-50 transition-colors ${c.code === countryCode ? 'bg-neutral-50 font-semibold' : ''}`}>
                                                        <span className="text-base">{c.flag}</span>
                                                        <span className="text-neutral-900 truncate">{c.label}</span>
                                                        <span className="ml-auto text-neutral-400 font-mono text-xs shrink-0">{c.code}</span>
                                                    </button>
                      )}
                                            </div>
                                        </div>
                  }
                                </div>
                                {/* Phone input */}
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="Create a strong password"
                className="w-full px-4 py-2.5 pr-10 text-sm border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {/* Password strength hints */}
                            {password.length > 0 &&
              <div className="mt-2 space-y-1">
                                    {PASSWORD_RULES.map((rule) => {
                  const pass = rule.test(password);
                  return (
                    <div key={rule.label} className={`flex items-center gap-1.5 text-xs ${pass ? 'text-green-600' : 'text-neutral-400'}`}>
                                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${pass ? 'bg-green-100' : 'bg-neutral-100'}`}>
                                                    <Check size={9} />
                                                </div>
                                                {rule.label}
                                            </div>);

                })}
                                </div>
              }
                        </div>

                        {/* Role badge */}
                        <div className="bg-neutral-100 rounded-lg px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                                <Truck size={14} className="text-white" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-neutral-800">Default role: Driver</div>
                                <div className="text-xs text-neutral-500">You can request a role change after signup</div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 active:bg-neutral-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-neutral-500 mt-6">
                        Already have an account?{' '}
                        <button onClick={onSwitchToLogin} className="font-semibold text-neutral-900 hover:underline">
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>);

}
