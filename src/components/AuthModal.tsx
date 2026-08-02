import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, RefreshCw, KeyRound, MailCheck } from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
}

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
  onLoginSuccess: (user: UserProfile, isNewAccount?: boolean) => void;
}

type AuthStep = 'initial' | 'verify_code' | 'set_password';

export const AuthModal: React.FC<AuthModalProps> = ({
  show,
  onClose,
  initialMode = 'signin',
  onLoginSuccess,
}) => {
  // Mode state: 'signin' | 'signup' | 'forgot'
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [signInMethod, setSignInMethod] = useState<'password' | 'code'>('password');
  const [isCodeLogin, setIsCodeLogin] = useState<boolean>(false);
  const [step, setStep] = useState<AuthStep>('initial');

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 6-Digit Code state
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [senderEmail, setSenderEmail] = useState<string>('noreply.sunnyai@gmail.com');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shakeInputs, setShakeInputs] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Sync initial mode
  useEffect(() => {
    setMode(initialMode);
    setStep('initial');
    setSignInMethod('password');
    setIsCodeLogin(false);
    setCodeDigits(['', '', '', '', '', '']);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode, show]);

  // Handle Resend Countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  if (!show) return null;

  // Real-time password strength calculations
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    const hasMinLen = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    if (hasMinLen) score += 20;
    if (hasUpper) score += 20;
    if (hasLower) score += 20;
    if (hasNumber) score += 20;
    if (hasSpecial) score += 20;

    let label = 'Weak';
    let colorClass = 'bg-red-500';

    if (score >= 80) {
      label = 'Super Secure';
      colorClass = 'bg-emerald-400 shadow-sm shadow-emerald-400';
    } else if (score >= 60) {
      label = 'Strong';
      colorClass = 'bg-green-500';
    } else if (score >= 40) {
      label = 'Fair';
      colorClass = 'bg-yellow-500';
    } else if (score > 0) {
      label = 'Weak';
      colorClass = 'bg-orange-500';
    }

    return { score, label, colorClass, hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial };
  };

  const pwdStrength = calculatePasswordStrength(password);

  // 1. Submit Initial Form (Sign In or Trigger 6-Digit Code Send)
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (mode === 'signin') {
      if (signInMethod === 'password') {
        if (!password) {
          setErrorMessage('Please enter your password.');
          return;
        }
        setLoading(true);
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Failed to sign in.');
          }

          onLoginSuccess(data.user);
          onClose();
        } catch (err: any) {
          setErrorMessage(err.message || 'Login failed. Please check credentials.');
        } finally {
          setLoading(false);
        }
      } else {
        // Sign In with 6-Digit Code
        setLoading(true);
        try {
          const res = await fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              type: 'signin_code',
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Failed to send verification code.');
          }

          if (data.senderEmail) setSenderEmail(data.senderEmail);

          setIsCodeLogin(true);
          setSuccessMessage(`6-digit login code sent from ${data.senderEmail || 'noreply.sunnyai@gmail.com'} to ${email}! Check your email inbox.`);
          setStep('verify_code');
          setResendCountdown(30);
        } catch (err: any) {
          setErrorMessage(err.message || 'Error dispatching verification code.');
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Create Account or Forgot Password -> Send 6-Digit Code
      if (mode === 'signup' && !fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            fullName,
            type: mode === 'signup' ? 'register' : 'forgot_password',
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to send verification code.');
        }

        if (data.senderEmail) setSenderEmail(data.senderEmail);

        setIsCodeLogin(false);
        setSuccessMessage(`6-digit security code sent from ${data.senderEmail || 'noreply.sunnyai@gmail.com'} to ${email}! Check your email inbox.`);
        setStep('verify_code');
        setResendCountdown(30);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error dispatching verification code.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle 6-digit code input typing & auto-focus
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...codeDigits];
    if (value.length > 1) {
      // Pasted multi-digit string
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setCodeDigits(newDigits);
      if (pasted.length === 6) {
        codeInputsRef.current[5]?.focus();
      }
      return;
    }

    newDigits[index] = value;
    setCodeDigits(newDigits);

    // Auto focus next box
    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  // 2. Submit 6-Digit Verification Code
  const handleVerifyCodeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullCode = codeDigits.join('');
    if (fullCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      setShakeInputs(true);
      setTimeout(() => setShakeInputs(false), 600);
      return;
    }

    setLoading(true);
    try {
      if (isCodeLogin || (mode === 'signin' && signInMethod === 'code')) {
        // Direct 6-Digit Code Authentication
        const res = await fetch('/api/auth/login-with-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: fullCode }),
        });
        const data = await res.json();

        if (!res.ok) {
          setShakeInputs(true);
          setTimeout(() => setShakeInputs(false), 600);
          throw new Error(data.error || 'Incorrect 6-digit verification code. Access denied until correct code is entered.');
        }

        setSuccessMessage('🎉 6-Digit Code Confirmed! Logging in...');
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 700);
      } else {
        // Registration / Password reset verification flow
        const res = await fetch('/api/auth/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: fullCode }),
        });
        const data = await res.json();

        if (!res.ok) {
          setShakeInputs(true);
          setTimeout(() => setShakeInputs(false), 600);
          throw new Error(data.error || 'Invalid 6-digit verification code. Please check your email and try again.');
        }

        setSuccessMessage('✅ Verification Code Confirmed! Proceeding to set a strong password...');
        setTimeout(() => {
          setStep('set_password');
          setSuccessMessage(null);
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid 6-digit verification code. Access denied until correct code is entered.');
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          type: isCodeLogin ? 'signin_code' : mode === 'signup' ? 'register' : 'forgot_password',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend code');

      setSuccessMessage(`New 6-digit code sent from ${data.senderEmail || 'noreply.sunnyai@gmail.com'}! Check your email inbox.`);
      setResendCountdown(30);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Password Setup
  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          code: codeDigits.join(''),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to setup account.');
      }

      setSuccessMessage('🎉 Account created and authenticated successfully!');
      setTimeout(() => {
        onLoginSuccess(data.user, true);
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Account setup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Container matching dark black, neon green & orange studio theme */}
      <div className="relative w-full max-w-md bg-[#080e0a] border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/50 overflow-hidden flex flex-col">
        {/* Glow Header Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-orange-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="px-7 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-extrabold tracking-widest text-orange-400 uppercase block">
                {step === 'verify_code'
                  ? 'EMAIL VERIFICATION'
                  : step === 'set_password'
                  ? 'CREATE PASSWORD'
                  : mode === 'signin'
                  ? 'WELCOME BACK'
                  : mode === 'signup'
                  ? 'GET STARTED'
                  : 'RESET ACCESS'}
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {step === 'verify_code'
                  ? 'Enter 6-Digit Code'
                  : step === 'set_password'
                  ? 'Create Strong Password'
                  : mode === 'signin'
                  ? 'Sign In to Account'
                  : mode === 'signup'
                  ? 'Create Your Account'
                  : 'Forgot Password?'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Only in Step 1) */}
        {step === 'initial' && (
          <div className="px-7 pt-2 pb-1">
            <div className="flex p-1 rounded-xl bg-[#0e1711] border border-emerald-500/20">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signin'
                    ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-7 space-y-4">
          {/* Global Alert Banners */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: INITIAL FORM (Sign In / Signup / Forgot)          */}
          {/* ========================================================= */}
          {step === 'initial' && (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Vance"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#040805] border border-emerald-500/30 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#040805] border border-emerald-500/30 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              {mode === 'signin' && (
                <div className="space-y-3 pt-1">
                  {/* Method Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                      SIGN IN METHOD
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#040805] border border-emerald-500/20">
                      <button
                        type="button"
                        onClick={() => {
                          setSignInMethod('password');
                          setErrorMessage(null);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          signInMethod === 'password'
                            ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Password</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSignInMethod('code');
                          setErrorMessage(null);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          signInMethod === 'code'
                            ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20 font-extrabold'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <MailCheck className="w-3.5 h-3.5 text-black" />
                        <span>6-Digit Code</span>
                      </button>
                    </div>
                  </div>

                  {signInMethod === 'password' ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-neutral-300">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setErrorMessage(null);
                          }}
                          className="text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#040805] border border-emerald-500/30 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/40 text-xs text-orange-200 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-white font-bold mb-0.5">Passwordless 6-Digit Code Login</strong>
                        We will send a 6-digit verification code to your email. Enter it on the next step to log into your account!
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <span>PROCESSING...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'signin'
                        ? signInMethod === 'password'
                          ? 'Sign In →'
                          : 'Send 6-Digit Login Code →'
                        : mode === 'signup'
                        ? 'Continue to 6-Digit Verification →'
                        : 'Send 6-Digit Code →'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Bottom Mode Switch Links */}
              <div className="text-center pt-2 text-xs text-neutral-400">
                {mode === 'signin' && (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setErrorMessage(null);
                      }}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </p>
                )}

                {mode === 'signup' && (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setErrorMessage(null);
                      }}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}

                {mode === 'forgot' && (
                  <p>
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setErrorMessage(null);
                      }}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 2: 6-DIGIT VERIFICATION CODE PAGE                    */}
          {/* ========================================================= */}
          {step === 'verify_code' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-2">
                <div className="inline-flex p-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <MailCheck className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-white">Verification Code Sent!</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  We sent a 6-digit confirmation code from{' '}
                  <strong className="text-orange-400 font-mono">{senderEmail}</strong> to{' '}
                  <strong className="text-emerald-300">{email}</strong>
                </p>
              </div>

              {/* Cool 6-Digit Code Input Boxes */}
              <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block text-center">
                    ENTER YOUR 6-DIGIT CODE:
                  </label>

                  <div className={`flex justify-center gap-2 ${shakeInputs ? 'animate-shake' : ''}`}>
                    {codeDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (codeInputsRef.current[idx] = el)}
                        type="text"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-11 h-13 text-center text-xl font-mono font-black rounded-xl bg-[#040805] border-2 border-emerald-500/40 text-emerald-300 focus:border-orange-500 focus:bg-[#08120a] focus:outline-none transition-all shadow-md shadow-emerald-950/40"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <span>VERIFYING CODE...</span>
                  ) : (
                    <>
                      <span>CONFIRM & CONTINUE →</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('initial')}
                    className="text-neutral-400 hover:text-white"
                  >
                    ← Change Email
                  </button>

                  <button
                    type="button"
                    disabled={resendCountdown > 0}
                    onClick={handleResendCode}
                    className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCountdown > 0
                        ? `Resend in ${resendCountdown}s`
                        : 'Resend Code'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: CREATE STRONG PASSWORD SCREEN                      */}
          {/* ========================================================= */}
          {step === 'set_password' && (
            <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-200">
                🔒 Security Check: Create a strong, unique password to complete your account setup.
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password..."
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#040805] border border-emerald-500/30 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-2 p-3 rounded-xl bg-[#050a06] border border-emerald-500/20">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-neutral-400">PASSWORD STRENGTH:</span>
                    <span className={`font-mono font-black ${pwdStrength.score >= 80 ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {pwdStrength.label} ({pwdStrength.score}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${pwdStrength.colorClass}`}
                      style={{ width: `${pwdStrength.score}%` }}
                    />
                  </div>

                  {/* Requirements List */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                    <span className={pwdStrength.hasMinLen ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                      {pwdStrength.hasMinLen ? '✓' : '○'} At least 8 characters
                    </span>
                    <span className={pwdStrength.hasUpper ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                      {pwdStrength.hasUpper ? '✓' : '○'} Uppercase letter (A-Z)
                    </span>
                    <span className={pwdStrength.hasLower ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                      {pwdStrength.hasLower ? '✓' : '○'} Lowercase letter (a-z)
                    </span>
                    <span className={pwdStrength.hasNumber ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                      {pwdStrength.hasNumber ? '✓' : '○'} Number (0-9)
                    </span>
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password..."
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#040805] border border-emerald-500/30 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <span>SAVING ACCOUNT...</span>
                ) : (
                  <>
                    <span>COMPLETE ACCOUNT SETUP & SIGN IN →</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
