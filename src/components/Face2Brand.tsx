import React, { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Download, User, Palette, Target, MessageSquare, Camera, Hash, BookOpen, Lightbulb, LogIn, Copy, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import Confetti from 'react-confetti';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import onboardingLottie from '../assets/onboarding-lottie.json';
import successLottie from '../assets/success-lottie.json';
import { v4 as uuidv4 } from 'uuid';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useNetworkStatus } from '@/hooks/use-network-status';
import BrandKitPDF from './BrandKitPDF';

interface FormData {
  name: string;
  ageRange: string;
  skinTone: string;
  vibeKeywords: string;
  expression: string;
}

interface BrandResult {
  brandName: string;
  colorPalette: string;
  personalityTraits: string;
  tagline: string | string[];
  niche: string;
  fontPairing: string;
  profilePhotoStyle: string;
  bio: string | string[];
  elevatorPitch: string;
  pdfTitle: string;
  contentIdeas: string | string[];
  usernameSuggestions: string;
}

interface Face2BrandProps {
  customMode?: boolean;
}

interface VisionFaceAnnotation {
  joyLikelihood?: string;
  sorrowLikelihood?: string;
  angerLikelihood?: string;
  surpriseLikelihood?: string;
}

interface VisionLabelAnnotation {
  description: string;
}

interface VisionColor {
  color: { red: number; green: number; blue: number };
}

interface VisionImageProperties {
  dominantColors: { colors: VisionColor[] };
}

interface VisionResponse {
  faceAnnotations?: VisionFaceAnnotation[];
  labelAnnotations?: VisionLabelAnnotation[];
  imagePropertiesAnnotation?: VisionImageProperties;
}

interface VisionAPIResult {
  responses?: VisionResponse[];
}

function summarizeVisionResult(visionResult: VisionAPIResult): string {
  if (!visionResult || !visionResult.responses || !visionResult.responses[0]) return 'No face analysis available.';
  const res = visionResult.responses[0];
  let summary = '';
  if (res.faceAnnotations && res.faceAnnotations.length > 0) {
    const face = res.faceAnnotations[0];
    const emotions = [
      face.joyLikelihood === 'VERY_LIKELY' ? 'joyful' : '',
      face.sorrowLikelihood === 'VERY_LIKELY' ? 'sorrowful' : '',
      face.angerLikelihood === 'VERY_LIKELY' ? 'angry' : '',
      face.surpriseLikelihood === 'VERY_LIKELY' ? 'surprised' : '',
    ].filter(Boolean).join(', ');
    summary += `Face detected. Emotions: ${emotions || 'neutral'}.`;
  }
  if (res.labelAnnotations && res.labelAnnotations.length > 0) {
    summary += ' Labels: ' + res.labelAnnotations.slice(0, 3).map((l: VisionLabelAnnotation) => l.description).join(', ') + '.';
  }
  if (res.imagePropertiesAnnotation && res.imagePropertiesAnnotation.dominantColors) {
    const colors = res.imagePropertiesAnnotation.dominantColors.colors.slice(0, 3).map((c: VisionColor) => c.color ? `rgb(${c.color.red},${c.color.green},${c.color.blue})` : '').join(', ');
    summary += ` Dominant colors: ${colors}.`;
  }
  return summary || 'No face analysis available.';
}

function RippleButton({ children, className = '', ...props }) {
  const [ripple, setRipple] = useState(false);
  const buttonRef = useRef(null);
  return (
    <button
      {...props}
      ref={buttonRef}
      className={`relative overflow-hidden ${className} transition-transform duration-150 active:scale-95 focus:ring-2 focus:ring-purple-400`}
      onMouseDown={e => {
        setRipple(false);
        setTimeout(() => setRipple(true), 10);
        if (props.onMouseDown) props.onMouseDown(e);
      }}
    >
      {children}
      {ripple && (
        <span className="absolute left-1/2 top-1/2 w-24 h-24 bg-purple-300 opacity-30 rounded-full animate-ripple -translate-x-1/2 -translate-y-1/2 pointer-events-none" onAnimationEnd={() => setRipple(false)} />
      )}
    </button>
  );
}

const Face2Brand = ({ customMode = false }: Face2BrandProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { online } = useNetworkStatus();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ageRange: '',
    skinTone: '',
    vibeKeywords: '',
    expression: ''
  });
  
  const [brandResult, setBrandResult] = useState<BrandResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [regenLoading, setRegenLoading] = useState<{ [key: string]: boolean }>({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  useEffect(() => {
    // Onboarding: Only show once per user (localStorage flag)
    if (!localStorage.getItem('onboardingShown')) {
      setShowOnboarding(true);
      localStorage.setItem('onboardingShown', 'true');
    }
    if (!localStorage.getItem('welcomeShown')) {
      setShowWelcome(true);
      localStorage.setItem('welcomeShown', 'true');
    }
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateBrand = async () => {
    if (!formData.name || !formData.vibeKeywords) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least your name and vibe keywords.",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    setShowConfetti(false);
    setShowSuccess(false);
    setBrandResult(null);
    try {
      // 1. Send selfie to Vision API proxy
      let visionResult = null;
      let visionSummary = '';
      if (selfiePreview) {
        const visionRes = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: selfiePreview.split(',')[1] || selfiePreview })
        });
        if (!visionRes.ok) throw new Error('Vision API error');
        visionResult = await visionRes.json();
        visionSummary = summarizeVisionResult(visionResult);
      }
      // 2. Polished prompt for OpenRouter
      const prompt = `You are a world-class brand strategist AI. Your job is to create a personal brand kit for the user below, using both their self-described details and a face analysis from Google Cloud Vision API.\n\n**User Details:**\n${JSON.stringify(formData)}\n\n**Face Analysis (from Vision API):**\n${visionSummary}\n\n**Instructions:**\n- Use both the user's self-description and the Vision API analysis to infer their personality, style, and vibe.\n- Output a single, valid JSON object with the following fields:\n  - brandName: A creative, memorable brand name.\n  - tagline: A catchy, inspiring tagline (string or array).\n  - colorPalette: 3-5 hex codes with short mood descriptions (string, array, or object).\n  - personalityTraits: 3-5 traits (comma-separated).\n  - niche: The user's likely niche or industry.\n  - fontPairing: Headings and body font suggestions.\n  - profilePhotoStyle: A description of the ideal profile photo style.\n  - bio: 1-2 sentence social bio (string or array).\n  - elevatorPitch: A 1-2 sentence pitch for the user.\n  - contentIdeas: 3-5 unique content ideas (array).\n  - usernameSuggestions: 2-3 creative social usernames (string or array).\n  - pdfTitle: A title for the brand kit PDF.\n\n**Output Requirements:**\n- Only output the JSON object. No markdown, no explanation, no extra text.\n- Be creative, but keep it professional and relevant to the user's vibe and face analysis.`;
      // 3. Send to OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "mistralai/mixtral-8x7b-instruct",
          messages: [
            { role: "user", content: prompt }
          ]
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error response:', errorText);
        throw new Error('Failed to fetch brand kit.');
      }
      const data = await response.json();
      let brandKitJson: any = {};
      try {
        brandKitJson = JSON.parse(data.choices[0].message.content);
      } catch (e) {
        throw new Error('Failed to parse LLM response as JSON.');
      }
      const apiResult: BrandResult = {
        brandName: brandKitJson.brandName || '',
        colorPalette: brandKitJson.colorPalette || '',
        personalityTraits: brandKitJson.personalityTraits || '',
        tagline: brandKitJson.taglines || brandKitJson.tagline || '',
        niche: brandKitJson.niche || '',
        fontPairing: brandKitJson.fontPairing || '',
        profilePhotoStyle: brandKitJson.profilePhotoStyle || '',
        bio: brandKitJson.bios || brandKitJson.bio || '',
        elevatorPitch: brandKitJson.elevatorPitch || '',
        pdfTitle: brandKitJson.pdfTitle || '',
        contentIdeas: brandKitJson.contentIdeasList || brandKitJson.contentIdeas || '',
        usernameSuggestions: brandKitJson.usernameSuggestions || '',
      };
      setBrandResult(apiResult);
      setShowConfetti(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      const id = uuidv4();
      const kitToSave = { ...apiResult, id };
      // Save to userBrandKits
      const userKits = JSON.parse(localStorage.getItem('userBrandKits') || '[]');
      localStorage.setItem('userBrandKits', JSON.stringify([kitToSave, ...userKits]));
      toast({
        title: "Brand Generated!",
        description: "Your personal brand kit is ready.",
      });
    } catch (error: any) {
      console.error('Error in brand generation:', error);
      // DEMO MODE: Fallback to mock data if API fails
      const mockResult: BrandResult = {
        brandName: `${formData.name.split(' ')[0]} Vision`,
        colorPalette: "#667eea (Trust & Innovation), #f093fb (Creativity & Energy), #2d3748 (Sophistication)",
        personalityTraits: "Innovative, Authentic, Visionary",
        tagline: "Turning ideas into impact, one vision at a time",
        niche: "Tech",
        fontPairing: "Headings: Inter Bold | Body: Source Sans Pro Regular",
        profilePhotoStyle: "Professional headshot with soft studio lighting, wearing modern business casual attire against a clean gradient background",
        bio: `${formData.name} | Tech Innovator & Visionary | Transforming ideas into digital solutions`,
        elevatorPitch: `I help businesses leverage cutting-edge technology to solve real-world problems. My unique approach combines technical expertise with human-centered design.`,
        pdfTitle: "The Visionary's Brand Kit",
        contentIdeas: "1. 'Tech trends that will change everything in 2024' 2. 'Behind the scenes of my latest project' 3. 'Why I switched from corporate to entrepreneurship'",
        usernameSuggestions: `@${formData.name.toLowerCase().replace(' ', '')}vision, @the${formData.name.split(' ')[0].toLowerCase()}way, @${formData.name.split(' ')[0].toLowerCase()}creates`
      };
      setBrandResult(mockResult);
      // Do NOT show confetti or success message for demo/mock data
      localStorage.setItem('brandKit', JSON.stringify(mockResult)); // Save for demo mode
      toast({
        title: "Demo Mode: Brand Generated!",
        description: "API failed, but you can still see a sample brand kit.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBrandKit = () => {
    toast({
      title: "Download Started",
      description: "Your brand kit PDF will be ready shortly.",
    });
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link Copied!',
      description: 'You can now share your brand kit link.',
    });
  };

  const regenerateSection = async (section: keyof BrandResult) => {
    setRegenLoading((prev) => ({ ...prev, [section]: true }));
    try {
      // Call OpenRouter API for just this section
      const response = await fetch('https://openrouter.ai/api/brandkit/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          section,
        }),
      });
      if (!response.ok) throw new Error('Failed to regenerate.');
      const data = await response.json();
      setBrandResult((prev) => prev ? { ...prev, [section]: data[section] || prev[section] } : prev);
    } catch (e) {
      toast({ title: 'Error', description: 'Could not regenerate. Try again.' });
    } finally {
      setRegenLoading((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelfieError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setSelfieError('Only JPG or PNG images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSelfieError('File size must be less than 5MB.');
      return;
    }
    setSelfie(file);
    const reader = new FileReader();
    reader.onloadend = () => setSelfiePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeSelfie = () => {
    setSelfie(null);
    setSelfiePreview(null);
    setSelfieError(null);
  };

  // Loading overlay for logo
  const LoadingLogoOverlay = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 pointer-events-none">
      <img
        src="/logoTransparent.png"
        alt="Loading Logo"
        className="h-24 w-24 animate-blink-slow drop-shadow-xl"
        style={{ filter: 'drop-shadow(0 0 16px #a18cd1)' }}
      />
    </div>
  );

  return user ? (
    <>
      {/* Welcome Modal for first-time visitors */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="flex flex-col items-center justify-center gap-4 max-w-md">
          <img src="/logoTransparent.png" alt="Face2BrandAI Logo" className="h-24 w-auto mb-2" />
          <h2 className="text-2xl font-bold text-center">Welcome to Face2Brand AI!</h2>
          <p className="text-center text-gray-600">We're excited to help you build your personal brand. Get started below!</p>
          <Button onClick={() => setShowWelcome(false)} className="w-full gradient-brand text-white">Get Started</Button>
        </DialogContent>
      </Dialog>
      {/* Onboarding Lottie Modal */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="flex flex-col items-center justify-center gap-4 max-w-md">
          <img src="/logoTransparent.png" alt="Face2BrandAI Logo" className="h-20 w-auto mb-2" />
          <Lottie animationData={onboardingLottie} style={{ width: 220, height: 220 }} loop />
          <h2 className="text-xl font-bold text-center">Welcome to Face2Brand AI!</h2>
          <p className="text-center text-gray-600">Transform your personality into a complete personal brand identity. Get started below!</p>
          <Button onClick={() => setShowOnboarding(false)} className="w-full gradient-brand text-white">Get Started</Button>
        </DialogContent>
      </Dialog>
      {/* Animated floating shapes background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-purple-200 rounded-full opacity-30 animate-float" />
        <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-pink-200 rounded-full opacity-20 animate-float-slow" />
        <div className="absolute top-1/2 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-float-reverse" />
      </div>
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -40 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="fixed top-8 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center gap-3 px-8 py-6 rounded-2xl shadow-2xl border-2 border-transparent bg-white/80 backdrop-blur-lg animate-fade-in"
          style={{
            borderImage: 'linear-gradient(90deg, #a78bfa, #f472b6, #60a5fa) 1',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <div className="text-4xl mb-1 animate-bounce">🎉</div>
          <Lottie animationData={successLottie} style={{ width: 90, height: 90 }} loop={false} />
          <span className="text-green-700 font-bold text-lg sm:text-xl text-center drop-shadow">Success! Brand Kit Ready</span>
          <span className="text-gray-600 text-sm text-center">Your personal brand kit has been generated. Download your PDF or explore your kit below!</span>
          <Button
            className="mt-2 w-full gradient-brand text-white font-semibold shadow-lg hover:scale-105 transition-transform"
            onClick={downloadBrandKit}
          >
            Download Brand Kit PDF
          </Button>
        </motion.div>
      )}
      {/* Back to Top Button (only if not customMode) */}
      {!customMode && (
        <button
          aria-label="Back to Top"
          onClick={handleBackToTop}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
          style={{ display: window.scrollY > 200 ? 'block' : 'none' }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </button>
      )}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <img src="/logoTransparent.png" alt="Face2BrandAI Logo" className="h-24 w-48 sm:h-32 sm:w-64 object-cover object-center drop-shadow-[0_4px_24px_rgba(80,0,180,0.15)] glow-logo" aria-label="Face2BrandAI Logo" />
          </div>
          <div className="flex justify-center items-center gap-2 text-gray-500 text-sm mb-2">
            <span>Built with</span>
            <span className="animate-orbit" aria-label="love">
              <img src="/love.png" alt="love" className="h-10 w-10 inline mx-1 align-middle animate-pulse spin-heart" />
            </span>
            <span>by <span className="font-bold">Yash Suthar</span> for Google Cloud Community Event</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight" aria-label="Transform your personality into a complete personal brand identity.">
            Transform your personality into a complete personal brand identity.
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-xs sm:max-w-2xl mx-auto font-light" aria-label="From colors to content, get everything you need to stand out.">
            From colors to content, get everything you need to stand out.
          </p>
          {/* User Authentication Section */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            <SignedIn>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!</span>
                <UserButton afterSignOutUrl="/auth" />
              </div>
            </SignedIn>
            <SignedOut>
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline" 
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Save Your Brand
              </Button>
            </SignedOut>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 justify-center items-start mt-8 sm:mt-12 transition-all">
          {/* Input Form */}
          <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-transform duration-200 backdrop-blur-md p-6 mb-8 lg:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-900 relative">
                Tell Us About You
                <span className="block h-1 w-16 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full mt-1 animate-gradient-x" />
              </h2>
            </div>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Selfie upload only if not customMode */}
              {!customMode && (
                !user ? (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl text-center text-purple-700 text-sm font-medium">
                    Please sign in to upload your selfie.
                  </div>
                ) : (
                  <div className="mb-6">
                    <label htmlFor="selfie-upload" className="block text-base font-semibold text-gray-900 mb-2">Step 1: Upload Your Selfie</label>
                    <div className="flex flex-col items-center gap-3">
                      {selfiePreview ? (
                        <div className="relative group">
                          <img
                            src={selfiePreview}
                            alt="Selfie Preview"
                            className="w-32 h-32 object-cover rounded-full border-2 border-purple-200 shadow-md hover:shadow-lg transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={removeSelfie}
                            className="absolute top-0 right-0 bg-white/80 rounded-full p-1 shadow hover:bg-red-100 transition-colors"
                            aria-label="Remove selfie"
                          >
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="selfie-upload" className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-purple-200 rounded-full bg-purple-50 cursor-pointer hover:bg-purple-100 transition-all duration-200">
                          <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          <input
                            id="selfie-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            className="hidden"
                            onChange={handleSelfieChange}
                            aria-label="Upload selfie"
                          />
                        </label>
                      )}
                      {selfieError && <span className="text-red-500 text-xs animate-bounce animate-fade-in">{selfieError}</span>}
                      <span className="text-xs text-gray-400 text-center mt-1">Your selfie is processed securely and never stored permanently.</span>
                    </div>
                  </div>
                )
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer text-gray-400">?</span>
                    </TooltipTrigger>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="e.g., Sarah Johnson"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`h-12 pl-10 focus:ring-2 focus:ring-purple-400 ${!formData.name && isGenerating ? 'border-red-500 animate-shake' : ''} focus:animate-pulse`}
                    aria-label="Full Name"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-5 h-5 pointer-events-none" />
                </div>
                {!formData.name && isGenerating && (
                  <span className="text-red-500 text-xs animate-bounce animate-fade-in">Name is required.</span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="age">Age Range</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer text-gray-400">?</span>
                    </TooltipTrigger>
                  </Tooltip>
                </div>
                <Select onValueChange={(value) => handleInputChange('ageRange', value)}>
                  <SelectTrigger className="h-12 pl-10">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-22">18-22</SelectItem>
                    <SelectItem value="23-27">23-27</SelectItem>
                    <SelectItem value="28-32">28-32</SelectItem>
                    <SelectItem value="33-37">33-37</SelectItem>
                    <SelectItem value="38-42">38-42</SelectItem>
                    <SelectItem value="43+">43+</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-400">Optional, but helps personalize your kit.</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="skinTone">Skin Tone</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer text-gray-400">?</span>
                    </TooltipTrigger>
                  </Tooltip>
                </div>
                <Input
                  id="skinTone"
                  placeholder="e.g., Warm Beige, Deep Brown, Cool Olive"
                  value={formData.skinTone}
                  onChange={(e) => handleInputChange('skinTone', e.target.value)}
                  className={`h-12 focus:ring-2 focus:ring-purple-400 focus:animate-pulse`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="vibe">Vibe Keywords *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer text-gray-400">?</span>
                    </TooltipTrigger>
                  </Tooltip>
                </div>
                <Textarea
                  id="vibe"
                  placeholder="e.g., Confident, Bold, Curious, Visionary, Creative"
                  value={formData.vibeKeywords}
                  onChange={(e) => handleInputChange('vibeKeywords', e.target.value)}
                  className={`min-h-20 ${!formData.vibeKeywords && isGenerating ? 'border-red-500' : ''} focus:animate-pulse`}
                />
                {!formData.vibeKeywords && isGenerating && (
                  <span className="text-red-500 text-xs animate-bounce animate-fade-in">Vibe keywords are required.</span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="expression">Facial Expression</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer text-gray-400">?</span>
                    </TooltipTrigger>
                  </Tooltip>
                </div>
                <Input
                  id="expression"
                  placeholder="e.g., Slight Smile, Intense Look, Calm Gaze"
                  value={formData.expression}
                  onChange={(e) => handleInputChange('expression', e.target.value)}
                  className={`h-12 focus:ring-2 focus:ring-purple-400 focus:animate-pulse`}
                />
              </div>

              <Button
                className="gradient-brand text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
                onClick={generateBrand}
                aria-label="Generate Brand Kit"
                disabled={isGenerating || !online}
                title={!online ? 'You are offline. Please connect to the internet to generate a brand kit.' : ''}
              >
                {isGenerating ? 'Generating...' : !online ? 'Offline' : 'Generate Brand Kit'}
              </Button>
            </CardContent>
          </div>

          {/* Results Display */}
          <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-transform duration-200 backdrop-blur-md p-6">
            {brandResult ? (
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <motion.span whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                        <Palette className="w-6 h-6 text-purple-600" />
                      </motion.span>
                      Your Brand Kit
                    </CardTitle>
                    <div className="flex gap-2 items-center">
                      {/* Desktop buttons */}
                      <div className="hidden sm:flex gap-2">
                        <RippleButton onClick={handleShare} variant="outline" className="gap-2" aria-label="Share Brand Kit">
                          <Copy className="w-4 h-4" />
                          Share
                        </RippleButton>
                        <PDFDownloadLink
                          document={<BrandKitPDF brandResult={brandResult} formData={formData} selfiePreview={selfiePreview} />}
                          fileName={`Face2BrandAI_BrandKit_${formData.name || 'user'}.pdf`}
                          className="w-full"
                        >
                          {({ loading }) => (
                            <RippleButton variant="outline" className="gap-2" aria-label="Download Brand Kit PDF" disabled={loading || pdfLoading}>
                              <Download className="w-4 h-4" />
                              {loading || pdfLoading ? 'Preparing PDF...' : 'Download PDF'}
                            </RippleButton>
                          )}
                        </PDFDownloadLink>
                      </div>
                      {/* Mobile dropdown menu */}
                      <div className="sm:hidden relative">
                        <select
                          className="block w-32 rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          onChange={e => {
                            if (e.target.value === 'share') handleShare();
                            if (e.target.value === 'pdf') downloadBrandKit();
                            e.target.selectedIndex = 0;
                          }}
                          aria-label="Brand Kit Actions"
                        >
                          <option value="">Actions</option>
                          <option value="share">Share</option>
                          <option value="pdf">Download PDF</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Accordion type="multiple" className="w-full transition-all duration-300">
                    <AccordionItem value="brandName">
                      <AccordionTrigger className="flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-500" />
                        <span className="font-bold">Brand Name</span>
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-semibold animate-gradient-x">{brandResult.brandName}</span>
                      </AccordionTrigger>
                      <AccordionContent className="accordion-content transition-all duration-300">
                        <p className="text-lg font-semibold text-purple-800">{brandResult.brandName}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="colorPalette">
                      <AccordionTrigger className="flex items-center gap-2"><Palette className="w-5 h-5 text-pink-500" />Color Palette</AccordionTrigger>
                      <AccordionContent className="accordion-content transition-all duration-300">
                        {typeof brandResult.colorPalette === 'string' ? (
                          <p>{brandResult.colorPalette}</p>
                        ) : Array.isArray(brandResult.colorPalette) ? (
                          <div>
                            {brandResult.colorPalette.map((c, i) => (
                              <span key={i} className="inline-block w-6 h-6 rounded-full mr-1" style={{ background: c }} title={c}></span>
                            ))}
                          </div>
                        ) : brandResult.colorPalette && typeof brandResult.colorPalette === 'object' ? (
                          <div>
                            {Object.entries(brandResult.colorPalette).map(([name, color], i) => (
                              <span key={i} className="inline-block w-6 h-6 rounded-full mr-1" style={{ background: color }} title={`${name}: ${color}`}></span>
                            ))}
                          </div>
                        ) : null}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="personalityTraits">
                      <AccordionTrigger className="flex items-center gap-2"><Target className="w-5 h-5 text-blue-500" />Personality Traits</AccordionTrigger>
                      <AccordionContent className="accordion-content transition-all duration-300">
                        <p>{brandResult.personalityTraits}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="tagline">
                      <AccordionTrigger className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500" />Tagline</AccordionTrigger>
                      <AccordionContent className="accordion-content flex flex-col gap-2 transition-all duration-300">
                        {Array.isArray(brandResult.tagline) ? (
                          brandResult.tagline.map((t, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <p className="italic">"{t}"</p>
                              <Button size="sm" variant="outline" onClick={() => setBrandResult(prev => prev ? { ...prev, tagline: t } : prev)}>Pick</Button>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="italic">"{brandResult.tagline}"</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => regenerateSection('tagline')} disabled={regenLoading.tagline} className="ml-2 flex items-center gap-1">
                                  {regenLoading.tagline ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div> : <Lightbulb className="w-4 h-4" />} Regenerate
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Regenerate this section</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="profilePhotoStyle">
                      <AccordionTrigger className="flex items-center gap-2"><Camera className="w-5 h-5 text-green-500" />Profile Photo Style</AccordionTrigger>
                      <AccordionContent className="accordion-content transition-all duration-300">
                        <p>{brandResult.profilePhotoStyle}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="usernameSuggestions">
                      <AccordionTrigger className="flex items-center gap-2"><Hash className="w-5 h-5 text-indigo-500" />Username Suggestions</AccordionTrigger>
                      <AccordionContent className="accordion-content transition-all duration-300">
                        <p>{brandResult.usernameSuggestions}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="bio">
                      <AccordionTrigger className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-pink-600" />Bio</AccordionTrigger>
                      <AccordionContent className="accordion-content flex flex-col gap-2 transition-all duration-300">
                        {Array.isArray(brandResult.bio) ? (
                          brandResult.bio.map((b, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <p>{b}</p>
                              <Button size="sm" variant="outline" onClick={() => setBrandResult(prev => prev ? { ...prev, bio: b } : prev)}>Pick</Button>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2">
                            <p>{brandResult.bio}</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => regenerateSection('bio')} disabled={regenLoading.bio} className="ml-2 flex items-center gap-1">
                                  {regenLoading.bio ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div> : <BookOpen className="w-4 h-4" />} Regenerate
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Regenerate this section</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="contentIdeas">
                      <AccordionTrigger className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" />Content Ideas</AccordionTrigger>
                      <AccordionContent className="accordion-content flex flex-col gap-2 transition-all duration-300">
                        {Array.isArray(brandResult.contentIdeas) ? (
                          brandResult.contentIdeas.map((c, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <p>{c}</p>
                              <Button size="sm" variant="outline" onClick={() => setBrandResult(prev => prev ? { ...prev, contentIdeas: c } : prev)}>Pick</Button>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2">
                            <p>{brandResult.contentIdeas}</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => regenerateSection('contentIdeas')} disabled={regenLoading.contentIdeas} className="ml-2 flex items-center gap-1">
                                  {regenLoading.contentIdeas ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div> : <Sparkles className="w-4 h-4" />} Regenerate
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Regenerate this section</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm h-96 flex items-center justify-center animate-fade-in">
                <div className="text-center text-gray-500">
                  <motion.span whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-300 animate-float" />
                  </motion.span>
                  <p className="text-lg">Your brand kit will appear here</p>
                  <p className="text-sm">Fill out the form and click generate</p>
                </div>
              </Card>
            )}
          </div>
          {/* Floating Action Button for mobile */}
          <div className="fixed bottom-8 right-8 z-50 block lg:hidden">
            <Button
              className="rounded-full shadow-xl gradient-brand text-white w-16 h-16 flex items-center justify-center text-2xl animate-bounce"
              aria-label="Generate My Brand Kit"
              onClick={generateBrand}
              disabled={isGenerating || !online}
              title={!online ? 'You are offline. Please connect to the internet to generate a brand kit.' : ''}
            >
              <Sparkles className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </div>
      {isGenerating && <LoadingLogoOverlay />}
    </>
  ) : (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {isGenerating && <LoadingLogoOverlay />}
      {/* Hero Section with CTA */}
      <section className="w-full py-16 flex flex-col items-center justify-center text-center bg-transparent">
        <img src="/logoTransparent.png" alt="Face2BrandAI Logo" className="h-24 w-auto mb-4 drop-shadow-lg" />
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Transform Your Personality Into a Brand</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">From colors to content, get everything you need to stand out. Built for Google Cloud Community Days.</p>
        <Button
          className="gradient-brand text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
          onClick={() => navigate('/auth')}
          aria-label="Sign In or Sign Up"
        >
          Get Started – Sign In / Sign Up
        </Button>
      </section>
      {/* Landing/Marketing Sections */}
      <section className="max-w-4xl mx-auto mt-16 mb-12 px-4"> {/* How It Works */} </section>
      <section className="max-w-4xl mx-auto mb-12 px-4"> {/* Features You Get */} </section>
      <section className="max-w-4xl mx-auto mb-12 px-4 flex flex-col items-center"> {/* Built For */} </section>
      <section className="max-w-4xl mx-auto mb-12 px-4 flex flex-col items-center"> {/* Meet the Creator */} </section>
      <section className="max-w-4xl mx-auto mb-12 px-4"> {/* Why Personal Branding Matters */} </section>
      <section className="max-w-4xl mx-auto mb-16 px-4"> {/* Get Early Access */} </section>
      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-gray-200 py-8 mt-8"> {/* footer content */} </footer>
    </div>
  );
};

export default Face2Brand;
