
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Download, User, Palette, Target, MessageSquare, Camera, Hash, BookOpen, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  tagline: string;
  niche: string;
  fontPairing: string;
  profilePhotoStyle: string;
  bio: string;
  elevatorPitch: string;
  pdfTitle: string;
  contentIdeas: string;
  usernameSuggestions: string;
}

const Face2Brand = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ageRange: '',
    skinTone: '',
    vibeKeywords: '',
    expression: ''
  });
  
  const [brandResult, setBrandResult] = useState<BrandResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    
    // Simulate API call for now - in real implementation, this would call OpenRouter API
    setTimeout(() => {
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
      setIsGenerating(false);
      
      toast({
        title: "Brand Generated!",
        description: "Your personal brand kit is ready.",
      });
    }, 3000);
  };

  const downloadBrandKit = () => {
    toast({
      title: "Download Started",
      description: "Your brand kit PDF will be ready shortly.",
    });
  };

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
            Transform your personality into a complete personal brand identity. From colors to content, get everything you need to stand out.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="w-6 h-6 text-purple-600" />
                Tell Us About You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sarah Johnson"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age Range</Label>
                <Select onValueChange={(value) => handleInputChange('ageRange', value)}>
                  <SelectTrigger className="h-12">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="skinTone">Skin Tone</Label>
                <Input
                  id="skinTone"
                  placeholder="e.g., Warm Beige, Deep Brown, Cool Olive"
                  value={formData.skinTone}
                  onChange={(e) => handleInputChange('skinTone', e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vibe">Vibe Keywords *</Label>
                <Textarea
                  id="vibe"
                  placeholder="e.g., Confident, Bold, Curious, Visionary, Creative"
                  value={formData.vibeKeywords}
                  onChange={(e) => handleInputChange('vibeKeywords', e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expression">Facial Expression</Label>
                <Input
                  id="expression"
                  placeholder="e.g., Slight Smile, Intense Look, Calm Gaze"
                  value={formData.expression}
                  onChange={(e) => handleInputChange('expression', e.target.value)}
                  className="h-12"
                />
              </div>

              <Button
                onClick={generateBrand}
                disabled={isGenerating}
                className="w-full h-14 text-lg gradient-brand text-white hover:opacity-90 transition-all duration-300"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Your Brand...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate My Brand Kit
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Display */}
          <div className="space-y-6">
            {brandResult ? (
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Palette className="w-6 h-6 text-purple-600" />
                      Your Brand Kit
                    </CardTitle>
                    <Button onClick={downloadBrandKit} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <strong>Brand Name</strong>
                      </div>
                      <p className="text-lg font-semibold text-purple-800">{brandResult.brandName}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="w-4 h-4 text-purple-600" />
                        <strong>Color Palette</strong>
                      </div>
                      <p>{brandResult.colorPalette}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-red-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <strong>Personality Traits</strong>
                      </div>
                      <p>{brandResult.personalityTraits}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <strong>Tagline</strong>
                      </div>
                      <p className="italic">"{brandResult.tagline}"</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-teal-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4 text-purple-600" />
                        <strong>Profile Photo Style</strong>
                      </div>
                      <p>{brandResult.profilePhotoStyle}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-purple-600" />
                        <strong>Username Suggestions</strong>
                      </div>
                      <p>{brandResult.usernameSuggestions}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <strong>Bio</strong>
                      </div>
                      <p>{brandResult.bio}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-purple-600" />
                        <strong>Content Ideas</strong>
                      </div>
                      <p>{brandResult.contentIdeas}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-300 animate-float" />
                  <p className="text-lg">Your brand kit will appear here</p>
                  <p className="text-sm">Fill out the form and click generate</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Face2Brand;
