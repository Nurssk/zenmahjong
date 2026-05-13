import { motion } from 'motion/react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

export function LoginScreen({ onNavigate }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] px-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,136,0,0.08)_0%,transparent_60%)]" />

      {/* Back button */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-6 left-6 flex items-center gap-2 text-[#888888] hover:text-[#ff8800] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff8800]/20 to-transparent rounded-2xl blur-2xl" />

        {/* Card content */}
        <div className="relative bg-[#151515]/90 backdrop-blur-xl border border-[#ff8800]/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(255,136,0,0.1)]">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ffaa00] to-[#ff6600] bg-clip-text text-transparent mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-[#888888]">
              {isSignUp ? 'Begin your journey' : 'Continue your journey'}
            </p>
          </div>

          {/* Google Sign In */}
          <button className="w-full flex items-center justify-center gap-3 px-6 py-4 mb-6 bg-white text-black rounded-xl hover:bg-gray-100 transition-colors font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#ff8800]/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#151515] text-[#888888]">or</span>
            </div>
          </div>

          {/* Email input */}
          <div className="mb-4">
            <label className="block text-sm text-[#888888] mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#ff8800]/30 rounded-xl focus:outline-none focus:border-[#ff8800] focus:ring-2 focus:ring-[#ff8800]/20 transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="mb-6">
            <label className="block text-sm text-[#888888] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#ff8800]/30 rounded-xl focus:outline-none focus:border-[#ff8800] focus:ring-2 focus:ring-[#ff8800]/20 transition-all"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={() => onNavigate('onboarding')}
            className="w-full py-4 bg-gradient-to-r from-[#ff8800] to-[#ff6600] rounded-xl font-bold hover:shadow-[0_0_30px_rgba(255,136,0,0.4)] transition-all"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          {/* Toggle sign up/sign in */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#888888] hover:text-[#ff8800] transition-colors"
            >
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <span className="text-[#ff8800]">Sign in</span>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <span className="text-[#ff8800]">Sign up</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
