import React, { useState, useEffect, useRef } from "react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Sparkles,
  Download,
  User,
  Palette,
  Target,
  MessageSquare,
  Camera,
  Hash,
  BookOpen,
  Lightbulb,
  LogIn,
  Copy,
  CheckCircle,
  Info as InfoIcon,
  Calendar as CalendarIcon,
  Smile as SmileIcon,
} from "lucide-react";
import { toast } from "../../features/common/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../components/ui/tooltip";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../components/ui/accordion";
import Confetti from "react-confetti";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import onboardingLottie from "../../assets/onboarding-lottie.json";
import successLottie from "../../assets/success-lottie.json";
import { v4 as uuidv4 } from "uuid";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useNetworkStatus } from "../../features/common/hooks/use-network-status";
import BrandKitPDF from "./BrandKitPDF";

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
  if (!visionResult || !visionResult.responses || !visionResult.responses[0])
    return "No face analysis available.";
  const res = visionResult.responses[0];
  let summary = "";
  if (res.faceAnnotations && res.faceAnnotations.length > 0) {
    const face = res.faceAnnotations[0];
    const emotions = [
      face.joyLikelihood === "VERY_LIKELY" ? "joyful" : "",
      face.sorrowLikelihood === "VERY_LIKELY" ? "sorrowful" : "",
      face.angerLikelihood === "VERY_LIKELY" ? "angry" : "",
      face.surpriseLikelihood === "VERY_LIKELY" ? "surprised" : "",
    ]
      .filter(Boolean)
      .join(", ");
    summary += `Face detected. Emotions: ${emotions || "neutral"}.`;
  }
  if (res.labelAnnotations && res.labelAnnotations.length > 0) {
    summary +=
      " Labels: " +
      res.labelAnnotations
        .slice(0, 3)
        .map((l: VisionLabelAnnotation) => l.description)
        .join(", ") +
      ".";
  }
  if (
    res.imagePropertiesAnnotation &&
    res.imagePropertiesAnnotation.dominantColors
  ) {
    const colors = res.imagePropertiesAnnotation.dominantColors.colors
      .slice(0, 3)
      .map((c: VisionColor) =>
        c.color ? `rgb(${c.color.red},${c.color.green},${c.color.blue})` : ""
      )
      .join(", ");
    summary += ` Dominant colors: ${colors}.`;
  }
  return summary || "No face analysis available.";
}

function RippleButton({ children, className = "", ...props }: { children: React.ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripple, setRipple] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <button
      {...props}
      ref={buttonRef}
      className={`relative overflow-hidden ${className} transition-transform duration-150 active:scale-95 focus:ring-2 focus:ring-purple-400`}
      onMouseDown={(e) => {
        setRipple(false);
        setTimeout(() => setRipple(true), 10);
        if (props.onMouseDown) props.onMouseDown(e);
      }}
    >
      {children}
      {ripple && (
        <span
          className="absolute left-1/2 top-1/2 w-24 h-24 bg-purple-300 opacity-30 rounded-full animate-ripple -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          onAnimationEnd={() => setRipple(false)}
        />
      )}
    </button>
  );
}

const Face2Brand = ({ customMode = false }: Face2BrandProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { online } = useNetworkStatus();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    ageRange: "",
    skinTone: "",
    vibeKeywords: "",
    expression: "",
  });

  const [brandResult, setBrandResult] = useState<BrandResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [regenLoading, setRegenLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    // Onboarding: Only show once per user (localStorage flag)
    if (!localStorage.getItem("onboardingShown")) {
      setShowOnboarding(true);
      localStorage.setItem("onboardingShown", "true");
    }
    if (!localStorage.getItem("welcomeShown")) {
      setShowWelcome(true);
      localStorage.setItem("welcomeShown", "true");
    }
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generateBrand = async () => {
    if (!formData.name || !formData.vibeKeywords) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least your name and vibe keywords.",
        variant: "destructive",
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
      let visionSummary = "";
      if (selfiePreview) {
        const visionRes = await fetch(`${apiBaseUrl}/api/vision`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: selfiePreview.split(",")[1] || selfiePreview,
          }),
        });
        if (!visionRes.ok) throw new Error("Vision API error");
        visionResult = await visionRes.json();
        visionSummary = summarizeVisionResult(visionResult);
      }
      // 2. Polished prompt for OpenRouter
      const prompt = `You are a world-class brand strategist AI. Your job is to create a personal brand kit for the user below, using both their self-described details and a face analysis from Google Cloud Vision API.\n\n**User Details:**\n${JSON.stringify(
        formData
      )}\n\n**Face Analysis (from Vision API):**\n${visionSummary}\n\n**Instructions:**\n- Use both the user's self-description and the Vision API analysis to infer their personality, style, and vibe.\n- Output a single, valid JSON object with the following fields:\n  - brandName: A creative, memorable brand name.\n  - tagline: A catchy, inspiring tagline (string or array).\n  - colorPalette: 3-5 hex codes with short mood descriptions (string, array, or object).\n  - personalityTraits: 3-5 traits (comma-separated).\n  - niche: The user's likely niche or industry.\n  - fontPairing: Headings and body font suggestions.\n  - profilePhotoStyle: A description of the ideal profile photo style.\n  - bio: 1-2 sentence social bio (string or array).\n  - elevatorPitch: A 1-2 sentence pitch for the user.\n  - contentIdeas: 3-5 unique content ideas (array).\n  - usernameSuggestions: 2-3 creative social usernames (string or array).\n  - pdfTitle: A title for the brand kit PDF.\n\n**Output Requirements:**\n- Only output the JSON object. No markdown, no explanation, no extra text.\n- Be creative, but keep it professional and relevant to the user's vibe and face analysis.`;
      // 3. Send to OpenRouter
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error response:", errorText);
        throw new Error("Failed to fetch brand kit.");
      }
      const data = await response.json();
      let brandKitJson: Record<string, unknown> = {};
      try {
        brandKitJson = JSON.parse(data.choices[0].message.content);
      } catch (e) {
        throw new Error("Failed to parse LLM response as JSON.");
      }
      const apiResult: BrandResult = {
        brandName: typeof brandKitJson.brandName === "string" ? brandKitJson.brandName : "",
        colorPalette: typeof brandKitJson.colorPalette === "string" || Array.isArray(brandKitJson.colorPalette) || (typeof brandKitJson.colorPalette === "object" && brandKitJson.colorPalette !== null)
          ? brandKitJson.colorPalette
          : "",
        personalityTraits: typeof brandKitJson.personalityTraits === "string" ? brandKitJson.personalityTraits : "",
        tagline: typeof brandKitJson.taglines === "string"
          ? brandKitJson.taglines
          : Array.isArray(brandKitJson.taglines)
          ? brandKitJson.taglines
          : typeof brandKitJson.tagline === "string"
          ? brandKitJson.tagline
          : Array.isArray(brandKitJson.tagline)
          ? brandKitJson.tagline
          : "",
        niche: typeof brandKitJson.niche === "string" ? brandKitJson.niche : "",
        fontPairing: typeof brandKitJson.fontPairing === "string" ? brandKitJson.fontPairing : "",
        profilePhotoStyle: typeof brandKitJson.profilePhotoStyle === "string" ? brandKitJson.profilePhotoStyle : "",
        bio: typeof brandKitJson.bios === "string"
          ? brandKitJson.bios
          : Array.isArray(brandKitJson.bios)
          ? brandKitJson.bios
          : typeof brandKitJson.bio === "string"
          ? brandKitJson.bio
          : Array.isArray(brandKitJson.bio)
          ? brandKitJson.bio
          : "",
        elevatorPitch: typeof brandKitJson.elevatorPitch === "string" ? brandKitJson.elevatorPitch : "",
        pdfTitle: typeof brandKitJson.pdfTitle === "string" ? brandKitJson.pdfTitle : "",
        contentIdeas:
          typeof brandKitJson.contentIdeasList === "string"
            ? brandKitJson.contentIdeasList
            : Array.isArray(brandKitJson.contentIdeasList)
            ? brandKitJson.contentIdeasList
            : typeof brandKitJson.contentIdeas === "string"
            ? brandKitJson.contentIdeas
            : Array.isArray(brandKitJson.contentIdeas)
            ? brandKitJson.contentIdeas
            : "",
        usernameSuggestions: typeof brandKitJson.usernameSuggestions === "string"
          ? brandKitJson.usernameSuggestions
          : Array.isArray(brandKitJson.usernameSuggestions)
          ? brandKitJson.usernameSuggestions
          : "",
      };
      setBrandResult(apiResult);
      setShowConfetti(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      const id = uuidv4();
      const kitToSave = { ...apiResult, id };
      // Save to userBrandKits
      const userKits = JSON.parse(
        localStorage.getItem("userBrandKits") || "[]"
      );
      localStorage.setItem(
        "userBrandKits",
        JSON.stringify([kitToSave, ...userKits])
      );
      toast({
        title: "Brand Generated!",
        description: "Your personal brand kit is ready.",
      });
    } catch (error: unknown) {
      console.error("Error in brand generation:", error);
      // DEMO MODE: Fallback to mock data if API fails
      const mockResult: BrandResult = {
        brandName: `${formData.name.split(" ")[0]} Vision`,
        colorPalette:
          "#667eea (Trust & Innovation), #f093fb (Creativity & Energy), #2d3748 (Sophistication)",
        personalityTraits: "Innovative, Authentic, Visionary",
        tagline: "Turning ideas into impact, one vision at a time",
        niche: "Tech",
        fontPairing: "Headings: Inter Bold | Body: Source Sans Pro Regular",
        profilePhotoStyle:
          "Professional headshot with soft studio lighting, wearing modern business casual attire against a clean gradient background",
        bio: `${formData.name} | Tech Innovator & Visionary | Transforming ideas into digital solutions`,
        elevatorPitch: `I help businesses leverage cutting-edge technology to solve real-world problems. My unique approach combines technical expertise with human-centered design.`,
        pdfTitle: "The Visionary's Brand Kit",
        contentIdeas:
          "1. 'Tech trends that will change everything in 2024' 2. 'Behind the scenes of my latest project' 3. 'Why I switched from corporate to entrepreneurship'",
        usernameSuggestions: `@${formData.name
          .toLowerCase()
          .replace(" ", "")}vision, @the${formData.name
          .split(" ")[0]
          .toLowerCase()}way, @${formData.name
          .split(" ")[0]
          .toLowerCase()}creates`,
      };
      setBrandResult(mockResult);
      // Do NOT show confetti or success message for demo/mock data
      localStorage.setItem("brandKit", JSON.stringify(mockResult)); // Save for demo mode
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
      title: "Link Copied!",
      description: "You can now share your brand kit link.",
    });
  };

  const regenerateSection = async (section: keyof BrandResult) => {
    setRegenLoading((prev) => ({ ...prev, [section]: true }));
    try {
      // Call OpenRouter API for just this section
      const response = await fetch(`${apiBaseUrl}/api/brandkit/section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          section,
        }),
      });
      if (!response.ok) throw new Error("Failed to regenerate.");
      const data = await response.json();
      setBrandResult((prev) =>
        prev ? { ...prev, [section]: data[section] || prev[section] } : prev
      );
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not regenerate. Try again.",
      });
    } finally {
      setRegenLoading((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelfieError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setSelfieError("Only JPG or PNG images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSelfieError("File size must be less than 5MB.");
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
        style={{ filter: "drop-shadow(0 0 16px #a18cd1)" }}
      />
    </div>
  );

  return user ? (
    <>
      {/* Welcome Modal for first-time visitors */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="flex flex-col items-center justify-center gap-4 max-w-md">
          <img
            src="/logoTransparent.png"
            alt="Face2BrandAI Logo"
            className="h-24 w-auto mb-2"
          />
          <h2 className="text-2xl font-bold text-center">
            Welcome to Face2Brand AI!
          </h2>
          <p className="text-center text-gray-600">
            We're excited to help you build your personal brand. Get started
            below!
          </p>
          <Button
            onClick={() => setShowWelcome(false)}
            className="w-full gradient-brand text-white"
          >
            Get Started
          </Button>
        </DialogContent>
      </Dialog>
      {/* Onboarding Lottie Modal */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="flex flex-col items-center justify-center gap-4 max-w-md">
          <img
            src="/logoTransparent.png"
            alt="Face2BrandAI Logo"
            className="h-20 w-auto mb-2"
          />
          <Lottie
            animationData={onboardingLottie}
            style={{ width: 220, height: 220 }}
            loop
          />
          <h2 className="text-xl font-bold text-center">
            Welcome to Face2Brand AI!
          </h2>
          <p className="text-center text-gray-600">
            Transform your personality into a complete personal brand identity.
            Get started below!
          </p>
          <Button
            onClick={() => setShowOnboarding(false)}
            className="w-full gradient-brand text-white"
          >
            Get Started
          </Button>
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
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="fixed top-8 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center gap-3 px-8 py-6 rounded-2xl shadow-2xl border-2 border-transparent bg-white/80 backdrop-blur-lg animate-fade-in"
          style={{
            borderImage: "linear-gradient(90deg, #a78bfa, #f472b6, #60a5fa) 1",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          }}
        >
          <div className="text-4xl mb-1 animate-bounce">🎉</div>
          <Lottie
            animationData={successLottie}
            style={{ width: 90, height: 90 }}
            loop={false}
          />
          <span className="text-green-700 font-bold text-lg sm:text-xl text-center drop-shadow">
            Success! Brand Kit Ready
          </span>
          <span className="text-gray-600 text-sm text-center">
            Your personal brand kit has been generated. Download your PDF or
            explore your kit below!
          </span>
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
          style={{ display: window.scrollY > 200 ? "block" : "none" }}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-arrow-up"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <img
              src="/logoTransparent.png"
              alt="Face2BrandAI Logo"
              className="h-24 w-48 sm:h-32 sm:w-64 object-cover object-center drop-shadow-[0_4px_24px_rgba(80,0,180,0.15)] glow-logo"
              aria-label="Face2BrandAI Logo"
            />
          </div>
          <div className="flex justify-center items-center gap-2 text-gray-500 text-sm mb-2">
            <span>Built with</span>
            <span className="animate-orbit" aria-label="love">
              <img
                src="/love.png"
                alt="love"
                className="h-10 w-10 inline mx-1 align-middle animate-pulse spin-heart"
              />
            </span>
            <span>
              by <span className="font-bold">Yash Suthar</span> for Google Cloud
              Community Event
            </span>
          </div>
          <h1
            className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight"
            aria-label="Transform your personality into a complete personal brand identity."
          >
            Transform your personality into a complete personal brand identity.
          </h1>
          <p
            className="text-base sm:text-xl text-gray-600 max-w-xs sm:max-w-2xl mx-auto font-light"
            aria-label="From colors to content, get everything you need to stand out."
          >
            From colors to content, get everything you need to stand out.
          </p>
          {/* User Authentication Section */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            <SignedIn>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">
                  Welcome back,{" "}
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
                </span>
                <UserButton afterSignOutUrl="/auth" />
              </div>
            </SignedIn>
            <SignedOut>
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Save Your Brand
              </Button>
            </SignedOut>
          </div>
        </div>
        {/* Input Form */}
        <section
          aria-labelledby="about-you-heading"
          className="w-full max-w-lg mx-auto mb-8"
        >
          <Card className="rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-white via-purple-50 to-pink-50/80 backdrop-blur-md">
            <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-7 h-7 text-purple-500" aria-hidden="true" />
                <h2
                  id="about-you-heading"
                  className="text-2xl font-extrabold text-gray-900 tracking-tight"
                >
                  Tell Us About You
                </h2>
              </div>
              <span className="text-sm text-gray-500 text-center max-w-xs">
                This info helps us create a brand kit that truly fits you. <span className="font-medium text-purple-500">No selfie required in custom mode!</span>
              </span>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-7 pt-2 pb-8">
              {/* Selfie upload only if not customMode */}
              {!customMode &&
                (!user ? (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl text-center text-purple-700 text-sm font-medium">
                    Please sign in to upload your selfie.
                  </div>
                ) : (
                  <div className="mb-6">
                    <label
                      htmlFor="selfie-upload"
                      className="block text-base font-semibold text-gray-900 mb-2"
                    >
                      Step 1: Upload Your Selfie
                    </label>
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
                            <svg
                              className="w-5 h-5 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="selfie-upload"
                          className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-purple-200 rounded-full bg-purple-50 cursor-pointer hover:bg-purple-100 transition-all duration-200"
                        >
                          <svg
                            className="w-10 h-10 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
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
                      {selfieError && (
                        <span className="text-red-500 text-xs animate-bounce animate-fade-in">
                          {selfieError}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 text-center mt-1">
                        Your selfie is processed securely and never stored permanently.
                      </span>
                    </div>
                  </div>
                ))}

              {/* Name */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <Label htmlFor="name" className="text-gray-900 font-semibold">
                    <User className="inline w-4 h-4 mr-1 text-purple-400" aria-hidden="true" />
                    Full Name <span className="text-pink-500">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} aria-label="Why do we need your name?" className="ml-1 cursor-pointer">
                        <InfoIcon className="w-4 h-4 text-gray-400" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>We use your name to personalize your brand kit.</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g., Sarah Johnson"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full h-12 text-gray-900 placeholder-gray-500 rounded-lg border px-10 py-2 ${!formData.name && isGenerating ? "border-red-500 animate-shake" : ""} focus:animate-pulse`}
                  aria-label="Full Name"
                  aria-required="true"
                />
                {!formData.name && isGenerating && (
                  <span className="text-red-500 text-xs animate-bounce animate-fade-in">
                    Name is required.
                  </span>
                )}
              </div>

              {/* Age Range */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <Label htmlFor="age" className="text-gray-900 font-semibold">
                    <CalendarIcon className="inline w-4 h-4 mr-1 text-blue-400" aria-hidden="true" />
                    Age Range
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} aria-label="Why do we need your age range?" className="ml-1 cursor-pointer">
                        <InfoIcon className="w-4 h-4 text-gray-400" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Optional, but helps personalize your kit.</TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  onValueChange={(value) => handleInputChange("ageRange", value)}
                  value={formData.ageRange}
                >
                  <SelectTrigger className="w-full h-12 pl-10">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under18">Under 18</SelectItem>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55+">55+</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-400">Optional, but helps personalize your kit.</span>
              </div>

              {/* Skin Tone */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <Label htmlFor="skinTone" className="text-gray-900 font-semibold">
                    <Palette className="inline w-4 h-4 mr-1 text-yellow-400" aria-hidden="true" />
                    Skin Tone
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} aria-label="Why do we need your skin tone?" className="ml-1 cursor-pointer">
                        <InfoIcon className="w-4 h-4 text-gray-400" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Optional, helps us suggest color palettes that suit you.</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="skinTone"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g., Warm Beige, Deep Brown, Cool Olive"
                  value={formData.skinTone}
                  onChange={(e) => handleInputChange("skinTone", e.target.value)}
                  className="w-full h-12 text-gray-900 placeholder-gray-500 rounded-lg border px-3 py-2 focus:animate-pulse"
                />
              </div>

              {/* Vibe Keywords */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <Label htmlFor="vibe" className="text-gray-900 font-semibold">
                    <Sparkles className="inline w-4 h-4 mr-1 text-pink-400" aria-hidden="true" />
                    Vibe Keywords <span className="text-pink-500">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} aria-label="What are vibe keywords?" className="ml-1 cursor-pointer">
                        <InfoIcon className="w-4 h-4 text-gray-400" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Describe your personality, style, or vibe in a few words.</TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="vibe"
                  placeholder="e.g., Confident, Bold, Curious, Visionary, Creative"
                  value={formData.vibeKeywords}
                  onChange={(e) => handleInputChange("vibeKeywords", e.target.value)}
                  className={`min-h-20 w-full text-gray-900 placeholder-gray-500 rounded-lg border px-3 py-2 ${!formData.vibeKeywords && isGenerating ? "border-red-500" : ""} focus:animate-pulse`}
                  aria-required="true"
                />
                {!formData.vibeKeywords && isGenerating && (
                  <span className="text-red-500 text-xs animate-bounce animate-fade-in">
                    Vibe keywords are required.
                  </span>
                )}
              </div>

              {/* Facial Expression */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <Label htmlFor="expression" className="text-gray-900 font-semibold">
                    <SmileIcon className="inline w-4 h-4 mr-1 text-green-400" aria-hidden="true" />
                    Facial Expression
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} aria-label="Why do we need your facial expression?" className="ml-1 cursor-pointer">
                        <InfoIcon className="w-4 h-4 text-gray-400" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Optional, helps us suggest a profile photo style.</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="expression"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g., Slight Smile, Intense Look, Calm Gaze"
                  value={formData.expression}
                  onChange={(e) => handleInputChange("expression", e.target.value)}
                  className="w-full h-12 text-gray-900 placeholder-gray-500 rounded-lg border px-3 py-2 focus:animate-pulse"
                />
              </div>

              <Button
                className="w-full gradient-brand text-white font-semibold shadow-lg hover:scale-105 transition-transform mt-4"
                aria-busy={isGenerating}
                disabled={isGenerating || !online}
                title={
                  !online
                    ? "You are offline. Please connect to the internet to generate a brand kit."
                    : ""
                }
                onClick={generateBrand}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Generating...
                  </span>
                ) : !online ? (
                  "Offline"
                ) : (
                  "Generate Brand Kit"
                )}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Results Display */}
        <div className="w-full rounded-2xl shadow-lg bg-white/90 p-4 sm:p-6">
          {brandResult ? (
            <Card className="max-w-2xl mx-auto mt-8 shadow-2xl rounded-3xl bg-white/90 backdrop-blur-lg p-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="text-green-500 w-8 h-8" />
                <h2 className="text-2xl font-extrabold text-gray-900">Your Brand Kit is Ready!</h2>
              </div>
              <Accordion type="multiple" className="space-y-4">
                <AccordionItem value="brandName">
                  <AccordionTrigger>
                    <User className="w-5 h-5 text-purple-500" /> Brand Name
                  </AccordionTrigger>
                  <AccordionContent>
                    <span className="text-xl font-bold">{brandResult.brandName}</span>
                    <Button onClick={() => navigator.clipboard.writeText(brandResult.brandName)} size="sm" className="ml-2">Copy</Button>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="colorPalette">
                  <AccordionTrigger>
                    <Palette className="w-5 h-5 text-pink-500" /> Color Palette
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex gap-2 mb-2">
                      {typeof brandResult.colorPalette === 'string' && brandResult.colorPalette.match(/#[0-9a-fA-F]{6}/g)
                        ? brandResult.colorPalette.match(/#[0-9a-fA-F]{6}/g)!.map((color) => (
                            <span
                              key={color}
                              className="w-8 h-8 rounded-full border"
                              style={{ background: color }}
                              title={color}
                            />
                          ))
                        : <span>{brandResult.colorPalette}</span>}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="personalityTraits">
                  <AccordionTrigger>
                    <Target className="w-5 h-5 text-blue-500" /> Personality Traits
                  </AccordionTrigger>
                  <AccordionContent>
                    <span>{brandResult.personalityTraits}</span>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tagline">
                  <AccordionTrigger>
                    <Lightbulb className="w-5 h-5 text-yellow-500" /> Tagline
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center gap-2">
                      <span className="italic">{Array.isArray(brandResult.tagline) ? brandResult.tagline[0] : brandResult.tagline}</span>
                      <Button onClick={() => navigator.clipboard.writeText(Array.isArray(brandResult.tagline) ? brandResult.tagline[0] : brandResult.tagline)} size="sm">Copy</Button>
                      <Button
                        size="sm"
                        onClick={() => regenerateSection('tagline')}
                        disabled={regenLoading.tagline}
                        className="ml-2 flex items-center gap-1"
                        aria-busy={regenLoading.tagline}
                      >
                        {regenLoading.tagline ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                        ) : (
                          <Lightbulb className="w-4 h-4" />
                        )} Regenerate
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="profilePhotoStyle">
                  <AccordionTrigger>
                    <Camera className="w-5 h-5 text-green-500" /> Profile Photo Style
                  </AccordionTrigger>
                  <AccordionContent>
                    <span>{brandResult.profilePhotoStyle}</span>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="usernameSuggestions">
                  <AccordionTrigger>
                    <Hash className="w-5 h-5 text-indigo-500" /> Username Suggestions
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center gap-2">
                      <span>{brandResult.usernameSuggestions}</span>
                      <Button onClick={() => navigator.clipboard.writeText(brandResult.usernameSuggestions)} size="sm">Copy</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bio">
                  <AccordionTrigger>
                    <BookOpen className="w-5 h-5 text-pink-600" /> Bio
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center gap-2">
                      <span>{Array.isArray(brandResult.bio) ? brandResult.bio[0] : brandResult.bio}</span>
                      <Button onClick={() => navigator.clipboard.writeText(Array.isArray(brandResult.bio) ? brandResult.bio[0] : brandResult.bio)} size="sm">Copy</Button>
                      <Button
                        size="sm"
                        onClick={() => regenerateSection('bio')}
                        disabled={regenLoading.bio}
                        className="ml-2 flex items-center gap-1"
                        aria-busy={regenLoading.bio}
                      >
                        {regenLoading.bio ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                        ) : (
                          <BookOpen className="w-4 h-4" />
                        )} Regenerate
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="contentIdeas">
                  <AccordionTrigger>
                    <Sparkles className="w-5 h-5 text-purple-400" /> Content Ideas
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {Array.isArray(brandResult.contentIdeas)
                        ? brandResult.contentIdeas.map((idea, idx) => <li key={idx}>{idea}</li>)
                        : brandResult.contentIdeas.split(/\d+\. /).filter(Boolean).map((idea, idx) => <li key={idx}>{idea}</li>)}
                    </ul>
                    <Button
                      size="sm"
                      onClick={() => regenerateSection('contentIdeas')}
                      disabled={regenLoading.contentIdeas}
                      className="ml-2 flex items-center gap-1 mt-2"
                      aria-busy={regenLoading.contentIdeas}
                    >
                      {regenLoading.contentIdeas ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )} Regenerate
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="flex gap-4 mt-8">
                <PDFDownloadLink
                  document={
                    <BrandKitPDF
                      kit={{
                        brandName: typeof brandResult.brandName === 'string' ? brandResult.brandName : 'N/A',
                        tagline: Array.isArray(brandResult.tagline)
                          ? (brandResult.tagline as string[]).join(", ")
                          : typeof brandResult.tagline === 'string'
                          ? brandResult.tagline
                          : 'N/A',
                        colorPalette: typeof brandResult.colorPalette === "string"
                          ? brandResult.colorPalette || 'N/A'
                          : Array.isArray(brandResult.colorPalette)
                          ? (brandResult.colorPalette as string[]).join(", ")
                          : 'N/A',
                        personalityTraits: typeof brandResult.personalityTraits === 'string' ? brandResult.personalityTraits : 'N/A',
                        profilePhotoStyle: typeof brandResult.profilePhotoStyle === "string"
                          ? brandResult.profilePhotoStyle || 'N/A'
                          : Array.isArray(brandResult.profilePhotoStyle)
                          ? (brandResult.profilePhotoStyle as string[]).join(", ")
                          : 'N/A',
                        usernameSuggestions: typeof brandResult.usernameSuggestions === "string"
                          ? brandResult.usernameSuggestions || 'N/A'
                          : Array.isArray(brandResult.usernameSuggestions)
                          ? (brandResult.usernameSuggestions as string[]).join(", ")
                          : 'N/A',
                        bio: Array.isArray(brandResult.bio)
                          ? ((brandResult.bio as string[]).length > 0 ? (brandResult.bio as string[]).join(" ") : 'N/A')
                          : typeof brandResult.bio === 'string'
                          ? brandResult.bio
                          : 'N/A',
                        contentIdeas: Array.isArray(brandResult.contentIdeas)
                          ? ((brandResult.contentIdeas as string[]).length > 0 ? (brandResult.contentIdeas as string[]).join(" | ") : 'N/A')
                          : typeof brandResult.contentIdeas === 'string'
                          ? brandResult.contentIdeas
                          : 'N/A',
                      }}
                    />
                  }
                  fileName={`Face2BrandAI_BrandKit_${formData.name || "user"}.pdf`}
                  className="w-full"
                >
                  {({ loading }) => (
                    <Button
                      className="gradient-brand text-white font-semibold shadow-lg hover:scale-105 transition-transform"
                      disabled={loading || pdfLoading}
                    >
                      <Download className="w-4 h-4" />
                      {loading || pdfLoading ? "Preparing PDF..." : "Download PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
                <Button
                  className="bg-white border border-purple-200 text-purple-700 font-semibold shadow hover:bg-purple-50 transition"
                  onClick={handleShare}
                >
                  <Copy className="w-4 h-4" /> Share
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm h-96 flex items-center justify-center animate-fade-in">
              <div className="text-center text-gray-500">
                <motion.span
                  whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-300 animate-float" />
                </motion.span>
                <p className="text-lg">Your brand kit will appear here</p>
                <p className="text-sm">
                  Fill out the form and click generate
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  ) : (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {isGenerating && <LoadingLogoOverlay />}
      {/* Hero Section with CTA */}
      <section className="w-full py-16 flex flex-col items-center justify-center text-center bg-transparent">
        <img
          src="/logoTransparent.png"
          alt="Face2BrandAI Logo"
          className="h-24 w-auto mb-4 drop-shadow-lg"
        />
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Transform Your Personality Into a Brand
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
          From colors to content, get everything you need to stand out. Built
          for Google Cloud Community Days.
        </p>
        <Button
          className="gradient-brand text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
          onClick={() => navigate("/auth")}
          aria-label="Sign In or Sign Up"
        >
          Get Started – Sign In / Sign Up
        </Button>
      </section>
      {/* Landing/Marketing Sections */}
      <section className="max-w-4xl mx-auto mt-16 mb-12 px-4">
        {" "}
        {/* How It Works */}{" "}
      </section>
      <section className="max-w-4xl mx-auto mb-12 px-4">
        {" "}
        {/* Features You Get */}{" "}
      </section>
      <section className="max-w-4xl mx-auto mb-12 px-4 flex flex-col items-center">
        {" "}
        {/* Built For */}{" "}
      </section>
      <section className="max-w-4xl mx-auto mb-12 px-4 flex flex-col items-center">
        {" "}
        {/* Meet the Creator */}{" "}
      </section>
      <section className="max-w-4xl mx-auto mb-12 px-4">
        {" "}
        {/* Why Personal Branding Matters */}{" "}
      </section>
      <section className="max-w-4xl mx-auto mb-16 px-4">
        {" "}
        {/* Get Early Access */}{" "}
      </section>
      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-gray-500 bg-white/80 mt-8 sm:mt-12">
        {" "}
        {/* footer content */}{" "}
      </footer>
    </div>
  );
};

export default Face2Brand;
