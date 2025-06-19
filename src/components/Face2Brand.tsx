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
import onboardingLottie from '../../public/onboarding-lottie.json';
import successLottie from '../../public/success-lottie.json';
import { v4 as uuidv4 } from 'uuid';
import { PDFDownloadLink } from '@react-pdf/renderer';
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

const Face2Brand = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
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

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  useEffect(() => {
    // Demo Mode: Load last brand kit from localStorage for judges
    const saved = localStorage.getItem('brandKit');
    if (saved) setBrandResult(JSON.parse(saved));
    // Onboarding: Only show once per user (localStorage flag)
    if (!localStorage.getItem('onboardingShown')) {
      setShowOnboarding(true);
      localStorage.setItem('onboardingShown', 'true');
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
      const response = await fetch('https://openrouter.ai/api/brandkit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to fetch brand kit.');
      const data = await response.json();
      const apiResult: BrandResult = {
        brandName: data.brandName || '',
        colorPalette: data.colorPalette || '',
        personalityTraits: data.personalityTraits || '',
        tagline: data.taglines || data.tagline || '',
        niche: data.niche || '',
        fontPairing: data.fontPairing || '',
        profilePhotoStyle: data.profilePhotoStyle || '',
        bio: data.bios || data.bio || '',
        elevatorPitch: data.elevatorPitch || '',
        pdfTitle: data.pdfTitle || '',
        contentIdeas: data.contentIdeasList || data.contentIdeas || '',
        usernameSuggestions: data.usernameSuggestions || '',
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
      console.error('OpenRouter API error:', error);
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
      setShowConfetti(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
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

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
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
        <div className="fixed top-8 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center gap-2 bg-green-100 border border-green-300 px-6 py-3 rounded-full shadow-lg animate-fade-in">
          <Lottie animationData={successLottie} style={{ width: 80, height: 80 }} loop={false} />
          <span className="text-green-700 font-semibold">Success! Brand Kit Ready</span>
        </div>
      )}
      {/* Back to Top Button */}
      <button
        aria-label="Back to Top"
        onClick={handleBackToTop}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
        style={{ display: window.scrollY > 200 ? 'block' : 'none' }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <img src="/logoTransparent.png" alt="Face2BrandAI Logo" className="h-24 w-48 sm:h-32 sm:w-64 object-cover object-center" />
          </div>
          <div className="flex justify-center items-center gap-2 text-gray-500 text-sm mb-2">
            <span>Built with</span>
            <span className="animate-orbit">
              <img src="/love.png" alt="love" className="h-10 w-10 inline mx-1 align-middle spin-heart" />
            </span>
            <span>by <span className="font-bold">Yash Suthar</span> for Google Cloud Community Event</span>
          </div>
          
          <p className="text-base sm:text-xl text-gray-600 max-w-xs sm:max-w-2xl mx-auto">
            Transform your personality into a complete personal brand identity. From colors to content, get everything you need to stand out.
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

        <SignedOut>
          <div className="max-w-xs sm:max-w-2xl mx-auto text-center mb-6 sm:mb-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
              <CardContent className="p-4 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
                <p className="text-gray-600 mb-6">
                  Please sign in to create and save your personal brand identity. Your brand kit will be personalized and saved to your account.
                </p>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="gradient-brand text-white hover:opacity-90 transition-all duration-300"
                  size="lg"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="max-w-full sm:max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Input Form */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
                    <motion.span whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </motion.span>
                    Tell Us About You
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
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
                        className={`h-12 pl-10 focus:ring-2 focus:ring-purple-400 ${!formData.name && isGenerating ? 'border-red-500' : ''} focus:animate-pulse`}
                        aria-label="Full Name"
                      />
                      <motion.span whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-5 h-5 pointer-events-none" />
                      </motion.span>
                    </div>
                    <span className="text-xs text-gray-400">This will be used as your brand's main name.</span>
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

                  <motion.button whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.04 }}
                    onClick={generateBrand}
                    disabled={isGenerating}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg gradient-brand text-white hover:opacity-90 transition-all duration-300"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating Your Brand...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <motion.span whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                          <Sparkles className="w-5 h-5" />
                        </motion.span>
                        Generate My Brand Kit
                      </div>
                    )}
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Display */}
            <div className="space-y-4 sm:space-y-6">
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
                            document={<BrandKitPDF kit={brandResult} />}
                            fileName={`Face2BrandAI-${brandResult.brandName || 'BrandKit'}.pdf`}
                            className="inline-block"
                          >
                            {({ loading }) => (
                              <RippleButton variant="outline" className="gap-2" aria-label="Download Brand Kit PDF" disabled={loading}>
                                <Download className="w-4 h-4" />
                                {loading ? 'Preparing PDF...' : 'Download PDF'}
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
                    <Accordion type="multiple" className="w-full">
                      <AccordionItem value="brandName">
                        <AccordionTrigger>Brand Name</AccordionTrigger>
                        <AccordionContent className="accordion-content">
                          <p className="text-lg font-semibold text-purple-800">{brandResult.brandName}</p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="colorPalette">
                        <AccordionTrigger>Color Palette</AccordionTrigger>
                        <AccordionContent className="accordion-content">
                          <p>{brandResult.colorPalette}</p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="personalityTraits">
                        <AccordionTrigger>Personality Traits</AccordionTrigger>
                        <AccordionContent className="accordion-content">
                          <p>{brandResult.personalityTraits}</p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="tagline">
                        <AccordionTrigger>Tagline</AccordionTrigger>
                        <AccordionContent className="accordion-content flex flex-col gap-2">
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
                              <Button size="sm" variant="outline" onClick={() => regenerateSection('tagline')} disabled={regenLoading.tagline} className="ml-2">
                                {regenLoading.tagline ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div> : 'Regenerate'}
                              </Button>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="profilePhotoStyle">
                        <AccordionTrigger>Profile Photo Style</AccordionTrigger>
                        <AccordionContent className="accordion-content">
                          <p>{brandResult.profilePhotoStyle}</p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="usernameSuggestions">
                        <AccordionTrigger>Username Suggestions</AccordionTrigger>
                        <AccordionContent className="accordion-content">
                          <p>{brandResult.usernameSuggestions}</p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="bio">
                        <AccordionTrigger>Bio</AccordionTrigger>
                        <AccordionContent className="accordion-content flex flex-col gap-2">
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
                              <Button size="sm" variant="outline" onClick={() => regenerateSection('bio')} disabled={regenLoading.bio} className="ml-2">
                                {regenLoading.bio ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div> : 'Regenerate'}
                              </Button>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="contentIdeas">
                        <AccordionTrigger>Content Ideas</AccordionTrigger>
                        <AccordionContent className="accordion-content flex flex-col gap-2">
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
                              <Button size="sm" variant="outline" onClick={() => regenerateSection('contentIdeas')} disabled={regenLoading.contentIdeas} className="ml-2">
                                {regenLoading.contentIdeas ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div> : 'Regenerate'}
                              </Button>
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
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Face2Brand;
