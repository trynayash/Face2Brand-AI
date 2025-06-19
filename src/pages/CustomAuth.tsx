import React, { useState } from 'react';
import { useSignIn, useSignUp, useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { OAuthStrategy } from '@clerk/types';

const CustomAuth = () => {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isSignedIn) navigate('/', { replace: true });
  }, [isSignedIn, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signIn') {
        const res = await signIn.create({ identifier: email, password });
        if (res.status === 'complete') {
          await setActiveSignIn({ session: res.createdSessionId });
          navigate('/', { replace: true });
        } else {
          setError('Check your email for a verification link.');
        }
      } else {
        const res = await signUp.create({ emailAddress: email, password });
        if (res.status === 'complete') {
          await setActiveSignUp({ session: res.createdSessionId });
          navigate('/', { replace: true });
        } else {
          setError('Check your email for a verification link.');
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Social login (if enabled in Clerk dashboard)
  const handleSocial = async (strategy: OAuthStrategy | 'saml' | 'enterprise_sso') => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signIn') {
        await signIn.authenticateWithRedirect({ strategy, redirectUrl: '/' });
      } else {
        await signUp.authenticateWithRedirect({ strategy, redirectUrl: '/' });
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || 'Social login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 animate-fade-in fade-in-mobile">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 mb-2 pop-mobile">
            <AvatarImage src="/Logo.jpeg" alt="Face2BrandAI Logo" className="bg-transparent rounded-full object-cover object-center" />
          </Avatar>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gradient mb-2">Face2Brand AI</h1>
          <div className="flex gap-2 mt-2">
            <button
              className={`px-4 py-2 rounded-full font-semibold transition-all ${mode === 'signIn' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setMode('signIn')}
              disabled={mode === 'signIn'}
            >
              Sign In
            </button>
            <button
              className={`px-4 py-2 rounded-full font-semibold transition-all ${mode === 'signUp' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setMode('signUp')}
              disabled={mode === 'signUp'}
            >
              Sign Up
            </button>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:outline-none text-base"
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:outline-none text-base"
            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
          />
          {error && <div className="text-red-500 text-sm animate-bounce animate-fade-in">{error}</div>}
          <Button type="submit" className="w-full h-12 gradient-brand text-white text-lg font-semibold ripple-mobile" disabled={loading}>
            {loading ? (mode === 'signIn' ? 'Signing In...' : 'Signing Up...') : (mode === 'signIn' ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>
        <div className="my-6 flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex flex-col gap-3">
          {/* Add/remove social providers as enabled in Clerk dashboard */}
          <Button onClick={() => handleSocial('oauth_google' as OAuthStrategy)} className="w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 ripple-mobile">
            Continue with Google
          </Button>
          <Button onClick={() => handleSocial('oauth_github' as OAuthStrategy)} className="w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 ripple-mobile">
            Continue with GitHub
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomAuth; 