import { useState, useRef, useEffect } from 'react';
import { Truck, Eye, EyeOff, AlertCircle, Phone, Mail, ArrowLeft, CheckCircle2, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { COUNTRY_CODES } from '@/data/countryCodes';
import { triggerFacebookOAuth, triggerGoogleOAuth } from '../services/socialAuth';








export function LoginPage({ onSwitchToSignup }) {
  const { login, loginWithGoogle, loginWithFacebook, sendOtp, verifyOtp } = useAuth();

  /* ── shared ─────────────────────────── */
  const [mode, setMode] = useState('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── email login ────────────────────── */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /* ── phone login ────────────────────── */
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [phoneStep, setPhoneStep] = useState('enter');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp] = useState();
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+?[1-9]\d{6,14}$/;

  /* ── countdown timer ────────────────── */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  /* ── Email submit ───────────────────── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {setError('Email is required');return;}
    if (!EMAIL_RE.test(email)) {setError('Please enter a valid email address');return;}
    if (!password) {setError('Password is required');return;}
    if (password.length < 6) {setError('Password must be at least 6 characters');return;}

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /* ── Send OTP ───────────────────────── */
  const handleSendOtp = async () => {
    setError('');
    const raw = phone.replace(/[\s\-()]/g, '');
    const cleaned = raw.startsWith('+') ? raw : `${countryCode}${raw}`;
    if (!PHONE_RE.test(cleaned)) {setError('Please enter a valid phone number');return;}

    setLoading(true);
    try {
      const otp = await sendOtp(cleaned);
      setDevOtp(otp);
      setPhoneStep('otp');
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP input handlers ─────────────── */
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value.slice(-1);
    setOtpDigits(updated);

    // Auto‐advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto‐submit when all 6 filled
    if (updated.every((d) => d !== '')) {
      verifyOtpCode(updated.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      const arr = paste.split('');
      setOtpDigits(arr);
      otpRefs.current[5]?.focus();
      verifyOtpCode(paste);
    }
  };

  /* ── Verify OTP ─────────────────────── */
  const verifyOtpCode = async (code) => {
    setError('');
    setLoading(true);
    try {
      const raw = phone.replace(/[\s\-()]/g, '');
      const cleaned = raw.startsWith('+') ? raw : `${countryCode}${raw}`;
      await verifyOtp(cleaned, code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /* ── OAuth stubs ────────────────────── */
  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const googleUser = await triggerGoogleOAuth();
      await loginWithGoogle(googleUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebook = async () => {
    setError('');
    setLoading(true);
    try {
      const fbUser = await triggerFacebookOAuth();
      await loginWithFacebook(fbUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Facebook login failed');
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
                        Manage your<br />
                        fleet with<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">precision</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-md leading-relaxed">
                        Real-time load tracking, permit management, and seamless payment processing — all in one place.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-8">
                    {[
          { value: '2,400+', label: 'Loads Tracked' },
          { value: '150+', label: 'Active Trucks' },
          { value: '99.9%', label: 'Uptime' }].
          map((stat) =>
          <div key={stat.label}>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-neutral-500 mt-0.5">{stat.label}</div>
                        </div>
          )}
                </div>
            </div>

            {/* ── Right login form ────────────────────────── */}
            <div className="flex-1 flex items-center justify-center bg-neutral-50 p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center">
                            <Truck size={16} className="text-white" />
                        </div>
                        <span className="text-lg font-bold text-neutral-900">TransportOps</span>
                    </div>

                    <h2 className="text-2xl font-bold text-neutral-900 mb-1">Welcome back</h2>
                    <p className="text-sm text-neutral-500 mb-8">Sign in to your account to continue</p>

                    {/* OAuth buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={handleGoogle} disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-all disabled:opacity-50">
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button onClick={handleFacebook} disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-all disabled:opacity-50">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </button>
                    </div>

                    {/* ── Mode toggle: Email | Phone ──────────── */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-neutral-200" />
                        <span className="text-xs text-neutral-400 font-medium">or continue with</span>
                        <div className="flex-1 h-px bg-neutral-200" />
                    </div>

                    <div className="flex bg-neutral-100 rounded-lg p-1 mb-6">
                        <button onClick={() => {setMode('email');setError('');}}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'email' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                            <Mail size={15} />
                            Email
                        </button>
                        <button onClick={() => {setMode('phone');setError('');}}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'phone' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                            <Phone size={15} />
                            Phone
                        </button>
                    </div>

                    {/* Error */}
                    {error &&
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
          }

                    {/* ── EMAIL MODE ─────────────────────────── */}
                    {mode === 'email' &&
          <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 text-sm border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 text-sm border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900/20" />
                                    <span className="text-xs text-neutral-500">Remember me</span>
                                </label>
                                <button type="button" className="text-xs text-neutral-500 hover:text-neutral-900 font-medium transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 active:bg-neutral-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>
          }

                    {/* ── PHONE MODE — Step 1: Enter phone ─── */}
                    {mode === 'phone' && phoneStep === 'enter' &&
          <div className="space-y-4">
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
                className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()} />
                                </div>
                                <p className="text-xs text-neutral-400 mt-1.5">We'll send a 6-digit code to this number</p>
                            </div>

                            <button onClick={handleSendOtp} disabled={loading}
            className="w-full py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 active:bg-neutral-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Sending OTP…' : 'Send OTP'}
                            </button>

                            {/* Dev-mode notice */}
                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-amber-700 leading-relaxed">
                                    <span className="font-semibold">Dev mode:</span> OTP is logged to the server console. In production, integrate an SMS provider (Twilio / MSG91) to deliver OTPs to real devices.
                                </p>
                            </div>
                        </div>
          }

                    {/* ── PHONE MODE — Step 2: Enter OTP ──── */}
                    {mode === 'phone' && phoneStep === 'otp' &&
          <div className="space-y-5">
                            {/* Back + info */}
                            <div>
                                <button onClick={() => {setPhoneStep('enter');setError('');}}
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 font-medium mb-3 transition-colors">
                                    <ArrowLeft size={14} />
                                    Change number
                                </button>
                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    OTP sent to <span className="font-semibold text-neutral-900">{phone.startsWith('+') ? phone : `${countryCode} ${phone}`}</span>
                                </div>
                            </div>

                            {/* Dev OTP hint */}
                            {devOtp &&
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2">
                                    <span className="font-semibold">Dev mode:</span> OTP is <span className="font-mono font-bold tracking-widest">{devOtp}</span>
                                </div>
            }

                            {/* OTP input boxes */}
                            <div>
                                <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">Enter OTP</label>
                                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                    {otpDigits.map((digit, i) =>
                <input key={i}
                ref={(el) => {otpRefs.current[i] = el;}}
                type="text" inputMode="numeric" maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl bg-white
                                                focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10
                                                transition-all
                                                ${digit ? 'border-neutral-900 text-neutral-900' : 'border-neutral-200 text-neutral-400'}`} />
                )}
                                </div>
                            </div>

                            {/* Verify + Resend */}
                            <button onClick={() => verifyOtpCode(otpDigits.join(''))}
            disabled={loading || otpDigits.some((d) => !d)}
            className="w-full py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 active:bg-neutral-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? 'Verifying…' : 'Verify & Sign in'}
                            </button>

                            <p className="text-center text-sm text-neutral-500">
                                Didn't receive code?{' '}
                                {resendTimer > 0 ?
              <span className="text-neutral-400">Resend in {resendTimer}s</span> :

              <button onClick={handleSendOtp} className="font-semibold text-neutral-900 hover:underline">
                                        Resend OTP
                                    </button>
              }
                            </p>
                        </div>
          }

                    <p className="text-center text-sm text-neutral-500 mt-6">
                        Don't have an account?{' '}
                        <button onClick={onSwitchToSignup} className="font-semibold text-neutral-900 hover:underline">
                            Create account
                        </button>
                    </p>
                </div>
            </div>
        </div>);

}