import Face2Brand from '@/components/Face2Brand';
import { useUser, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import onboardingLottie from '../assets/onboarding-lottie.json';

const Index = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [showChoice, setShowChoice] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      setShowChoice(true);
    }
  }, [isSignedIn]);

  if (showChoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Project-wide Background Image */}
        <div className="absolute inset-0 -z-10">
          <img src="/Background.png" alt="Background" className="w-full h-full object-cover fixed" style={{ minHeight: '100vh', minWidth: '100vw' }} />
        </div>
        <div className="fixed inset-0 bg-black/40 z-40" />
        <div className="z-50 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center gap-6 animate-fade-in">
          <img src="/logoTransparent.png" alt="Logo" className="h-64 w-auto mt-6 mb-4 drop-shadow-xl" />
          <h2 className="text-2xl font-bold text-center mb-2">Choose Your Brand Kit Flow</h2>
          <p className="text-gray-600 text-center mb-4">How would you like to create your brand kit?</p>
          <div className="flex flex-col gap-4 w-full">
            <Button className="w-full gradient-brand text-white font-semibold py-3 text-lg" onClick={() => navigate('/face2brand')}>Selfie-based Brand Kit</Button>
            <Button className="w-full bg-gray-100 text-purple-700 font-semibold py-3 text-lg border border-purple-200 hover:bg-purple-50" onClick={() => navigate('/custombrandkit')}>Manual Detailed Brand Kit</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Project-wide Background Image */}
      <div className="absolute inset-0 -z-10">
        <img src="/Background.png" alt="Background" className="w-full h-full object-cover fixed" style={{ minHeight: '100vh', minWidth: '100vw' }} />
      </div>
      <img src="/logoTransparent.png" alt="Logo" className="h-64 w-auto mt-6 mb-4 drop-shadow-xl" />
      <section id="home" className="flex flex-col items-center justify-center text-center py-8 px-4 w-full max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 text-white text-glow">Transform Your Personality Into a Brand</h1>
        <p className="text-base sm:text-lg text-secondary mb-6 max-w-2xl animate-fade-in text-glow">From selfie to strategy: AI builds your complete brand kit for the digital world. Built for Google Cloud Community Days 2025.</p>
        <Button className="gradient-brand text-white px-6 py-3 text-base font-bold rounded-full shadow-lg hover:scale-105 transition-transform animate-bounce" onClick={() => navigate('/login')}>Get Started</Button>
      </section>
      {/* GCCD 2025 New Delhi Event Section */}
      <section className="max-w-3xl mx-auto mb-12 px-4 w-full text-center animate-fade-in-up">
        <div className="bg-white/90 rounded-2xl shadow-xl p-6 border border-purple-100 flex flex-col items-center on-white-bg">
          <img src="/GoogleCloudLogo.png" alt="Google Cloud Logo" className="h-10 w-auto mb-3" />
          <h2 className="text-3xl font-bold mb-2 text-purple-700">Google Cloud Community Days 2025</h2>
          <p className="text-lg text-gray-700 mb-2">Hosted by GDG Cloud New Delhi</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
            <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">June 28, 2025</span>
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">Radisson Blu Plaza, Delhi Airport</span>
          </div>
          <p className="mb-4 text-gray-600">A power-packed day of tech talks, hands-on sessions, and networking with 400+ cloud enthusiasts, developers, and industry experts. Dive into Google Cloud, AI/ML, DevOps, Firebase, Vertex AI, and more!</p>
          <ul className="text-left text-gray-700 mx-auto max-w-xl mb-4 list-disc list-inside">
            <li>Expert-led talks from Googlers & industry leaders</li>
            <li>Immersive code labs, demos, and an Experience Zone</li>
            <li>Career & learning opportunities</li>
            <li>AI/ML community projects & showcases</li>
            <li>Networking, swag, and more!</li>
          </ul>
          <a href="https://gdg.community.dev/events/details/google-gdg-cloud-new-delhi-presents-google-cloud-community-days-2025/" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">Learn More & Register</a>
        </div>
      </section>
      <section id="features" className="max-w-4xl mx-auto mb-12 px-4 w-full">
        <h2 className="text-2xl font-bold text-center mb-6 tracking-tight">Features</h2>
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-stretch">
          {/* Selfie-based Brand Kit Card */}
          <div className="flex-1 bg-white/90 rounded-xl shadow border border-purple-100 p-6 flex flex-col items-center text-center transition-transform hover:scale-105 on-white-bg">
            <div className="bg-purple-50 rounded-full p-3 mb-3 flex items-center justify-center">
              <img src="/selfie-icon.png" alt="Selfie Icon" className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Selfie-based Brand Kit</h3>
            <p className="text-gray-600 mb-4 text-sm">Upload your selfie and let AI craft a brand identity that matches your personality and look.</p>
            <Button className="gradient-brand text-white px-5 py-2 text-sm font-bold rounded-full shadow hover:scale-105 transition-transform" onClick={() => navigate('/face2brand')}>Try Now</Button>
          </div>
          {/* Manual Brand Kit Card */}
          <div className="flex-1 bg-white/90 rounded-xl shadow border border-purple-100 p-6 flex flex-col items-center text-center transition-transform hover:scale-105 on-white-bg">
            <div className="bg-purple-50 rounded-full p-3 mb-3 flex items-center justify-center">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-50 shadow border border-blue-200">
                <img src="/BrandKit.jpg" alt="Manual Brand Kit Icon" className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm" />
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Manual Detailed Brand Kit</h3>
            <p className="text-gray-600 mb-4 text-sm">Prefer more control? Fill out a detailed form to generate a custom brand kit tailored to your vision.</p>
            <Button className="gradient-brand text-white px-5 py-2 text-sm font-bold rounded-full shadow hover:scale-105 transition-transform" onClick={() => navigate('/custombrandkit')}>Try Now</Button>
          </div>
        </div>
        <div className="my-10 border-t border-dashed border-gray-200" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-center mt-2">
          <div className="flex flex-col items-center">
            <div className="bg-purple-100 rounded-full p-3 mb-2"><svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg></div>
            <span className="font-medium text-sm">Upload a Selfie</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 rounded-full p-3 mb-2"><svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" /></svg></div>
            <span className="font-medium text-sm">Describe Your Vision</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-green-100 rounded-full p-3 mb-2"><svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5" /></svg></div>
            <span className="font-medium text-sm">AI Builds Your Brand Kit</span>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section id="how" className="max-w-4xl mx-auto mb-16 px-4 w-full">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="bg-purple-100 rounded-full p-4 mb-2"><svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg></div>
            <span className="font-medium">1. Upload Selfie</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 rounded-full p-4 mb-2"><svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" /></svg></div>
            <span className="font-medium">2. Describe Yourself</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-green-100 rounded-full p-4 mb-2"><svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5" /></svg></div>
            <span className="font-medium">3. Get Your Brand Kit</span>
          </div>
        </div>
      </section>
      {/* Demo Cards / Screenshots Section */}
      <section className="max-w-4xl mx-auto mb-16 px-4 w-full">
        <h2 className="text-2xl font-bold text-center mb-8">See the Output</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start on-white-bg">
            <span className="text-xs font-semibold text-purple-500 mb-2">Brand Name</span>
            <span className="text-lg font-bold mb-1">Visionnaire</span>
            <span className="text-xs font-semibold text-gray-400 mb-2">Tagline</span>
            <span className="italic mb-2">Lead with clarity.</span>
            <span className="text-xs font-semibold text-gray-400 mb-2">Font Pairing</span>
            <span className="mb-2">Playfair Display, Lato</span>
            <span className="text-xs font-semibold text-gray-400 mb-2">Color Palette</span>
            <div className="flex gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#0B132B] border" />
              <span className="w-6 h-6 rounded-full bg-[#1C2541] border" />
              <span className="w-6 h-6 rounded-full bg-[#3A506B] border" />
            </div>
            <span className="text-xs font-semibold text-gray-400 mb-2">Profile Photo Style</span>
            <span className="mb-2">Soft vintage tone with neutral background</span>
            <span className="text-xs font-semibold text-gray-400 mb-2">Niche</span>
            <span>Content Creator – Self Growth</span>
            <span className="text-xs font-semibold text-gray-400 mb-2">Social Bio</span>
            <span>Empowering visionaries | Built on values | </span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-start on-white-bg">
            <span className="text-xs font-semibold text-purple-500 mb-2">Brand Name</span>
            <span className="text-lg font-bold mb-1">Boldly You</span>
            <span className="text-xs font-semibold text-gray-400 mb-2">Tagline</span>
            <span className="italic mb-2">Unleash your inner creator.</span>
            <span className="text-xs font-semibold text-gray-400 mb-2">Font Pairing</span>
            <span className="mb-2">Montserrat, Open Sans</span>
            <span className="text-xs font-semibold text-gray-400 mb-2">Color Palette</span>
            <div className="flex gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#FF6F61] border" />
              <span className="w-6 h-6 rounded-full bg-[#F7CAC9] border" />
              <span className="w-6 h-6 rounded-full bg-[#92A8D1] border" />
            </div>
            <span className="text-xs font-semibold text-gray-400 mb-2">Profile Photo Style</span>
            <span className="mb-2">Bright, modern, high-contrast</span>
            <span className="text-xs font-semibold text-gray-400 mb-2">Niche</span>
            <span>Entrepreneur – Digital Products</span>
            <span className="text-xs font-semibold text-gray-400 mb-2">Social Bio</span>
            <span>Building in public | Digital products | </span>
          </div>
        </div>
      </section>
      <CookieBanner />
    </div>
  );
};

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('cookieConsent')) {
      setVisible(true);
    }
  }, []);
  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
  };
  const denyCookies = () => {
    localStorage.setItem('cookieConsent', 'denied');
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-center px-4 py-3 bg-gradient-to-r from-purple-900 via-purple-700 to-pink-700 text-white shadow-lg animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 max-w-3xl w-full">
        <span className="text-sm sm:text-base font-medium">
          We use cookies to enhance your experience. By using Face2Brand AI, you agree to our <a href="/terms" className="underline hover:text-pink-200 transition-colors">Terms & Conditions</a>.
        </span>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={acceptCookies}
            className="px-6 py-2 rounded-full bg-white text-purple-800 font-bold shadow hover:bg-pink-100 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400"
            aria-label="Accept cookies"
          >
            Accept
          </button>
          <button
            onClick={denyCookies}
            className="px-6 py-2 rounded-full bg-pink-100 text-pink-800 font-bold shadow hover:bg-white hover:text-purple-800 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400"
            aria-label="Deny cookies"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
