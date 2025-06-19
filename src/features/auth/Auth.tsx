import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Sparkles, User, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Avatar, AvatarImage } from '../../components/ui/avatar';
import { motion } from 'framer-motion';
import { useNetworkStatus } from '../../features/common/hooks/use-network-status';

const Auth = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();
  const { online } = useNetworkStatus();

  useEffect(() => {
    // Only redirect if Clerk has finished loading and user is signed in
    if (isLoaded && isSignedIn) {
      navigate('/', { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-pink-100 relative overflow-hidden">
      {/* Subtle animated background shapes */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-float" />
        <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-pink-200 rounded-full opacity-10 animate-float-slow" />
        <div className="absolute top-1/2 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-10 animate-float-reverse" />
      </div>
      <div className="absolute top-4 left-4 z-10">
        <a href="/" aria-label="Back to Home" className="group">
          <svg className="w-8 h-8 text-purple-500 group-hover:text-purple-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </a>
      </div>
      <div className="w-full max-w-md mx-auto z-10">
        <div className="flex flex-col items-center mb-8">
          <img src="/logoTransparent.png" alt="Face2BrandAI Logo" className="h-32 w-auto mb-4 drop-shadow-xl" />
          <p className="text-lg text-gray-700 font-semibold text-center mb-2">Transform your personality into a complete personal brand identity</p>
        </div>
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-100">
          <SignedOut>
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Sign in to continue</h2>
              <SignInButton mode="modal" forceRedirectUrl="/">
                <Button className="w-full h-12 gradient-brand text-white text-lg font-semibold rounded-lg shadow-md" disabled={!online} title={!online ? 'You are offline. Please connect to the internet to sign in.' : ''}>Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/">
                <Button variant="outline" className="w-full h-12 border-purple-200 text-purple-700 text-lg font-semibold rounded-lg shadow-md" disabled={!online} title={!online ? 'You are offline. Please connect to the internet to sign up.' : ''}>Create Account</Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex flex-col items-center gap-4">
              <UserButton afterSignOutUrl="/auth" />
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
              <p className="text-gray-600 font-medium">Redirecting you to the app...</p>
            </div>
          </SignedIn>
        </div>
        <div className="flex justify-center items-center gap-2 text-gray-400 text-xs mt-6">
          <span>Built with</span>
          <img src="/love.png" alt="love" className="h-6 w-6 inline mx-1 align-middle animate-blink-slow" />
          <span>by <span className="font-bold">Yash Suthar</span> for Google Cloud Community Event</span>
        </div>
      </div>
    </div>
  );
};

export default Auth; 