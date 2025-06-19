
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, User, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

const Auth = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // Only redirect if Clerk has finished loading and user is signed in
    if (isLoaded && isSignedIn) {
      navigate('/', { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600 animate-pulse-slow" />
            <h1 className="text-4xl md:text-6xl font-bold text-gradient">Face2Brand AI</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your personality into a complete personal brand identity
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <SignedOut>
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                  Welcome to Face2Brand AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-gray-600 mb-6">
                  Sign in to start creating your personal brand identity
                </p>
                
                <div className="space-y-3">
                  <SignInButton mode="modal" forceRedirectUrl="/">
                    <Button className="w-full h-12 gradient-brand text-white hover:opacity-90 transition-all duration-300">
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </Button>
                  </SignInButton>
                  
                  <SignUpButton mode="modal" forceRedirectUrl="/">
                    <Button variant="outline" className="w-full h-12 border-purple-200 hover:bg-purple-50">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
                    </Button>
                  </SignUpButton>
                </div>
              </CardContent>
            </Card>
          </SignedOut>

          <SignedIn>
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <UserButton afterSignOutUrl="/auth" />
                </div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Redirecting you to the app...
                </p>
              </CardContent>
            </Card>
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default Auth;
