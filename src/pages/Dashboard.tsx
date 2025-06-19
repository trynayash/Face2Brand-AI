import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserButton } from '@clerk/clerk-react';

interface BrandKit {
  brandName?: string;
  tagline?: string;
  fontPairing?: string;
  colorPalette?: string | string[] | Record<string, string>;
  profilePhotoStyle?: string;
  niche?: string;
  socialBio?: string;
}

const Dashboard = () => {
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [vision, setVision] = useState('');
  const [expression, setExpression] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Only JPG or PNG images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
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
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!selfie || !name || !vision || !expression) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const prompt = `You are a brand strategist AI. Given this selfie (base64 string or placeholder) and these details, generate a JSON brand kit with: brandName, tagline, fontPairing, colorPalette, profilePhotoStyle, niche, socialBio.\n\nSelfie: [base64 omitted]\nName: ${name}\nVision/Goal: ${vision}\nExpression/Personality: ${expression}`;
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistralai/mixtral-8x7b-instruct',
          messages: [
            { role: 'user', content: prompt }
          ]
        }),
      });
      if (!response.ok) {
        setError('Failed to generate brand kit.');
        setLoading(false);
        return;
      }
      const data = await response.json();
      let kit: BrandKit = {};
      const content: string = data.choices[0].message.content;
      // Try to extract JSON from the response, even if surrounded by text/markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          kit = JSON.parse(jsonMatch[0]);
        } catch (e) {
          setError('Failed to parse AI response. Raw: ' + content);
          setLoading(false);
          return;
        }
      } else {
        setError('Failed to find JSON in AI response. Raw: ' + content);
        setLoading(false);
        return;
      }
      setBrandKit(kit);
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewKit = () => {
    setSelfie(null);
    setSelfiePreview(null);
    setName('');
    setVision('');
    setExpression('');
    setBrandKit(null);
    setError('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      {loading && <LoadingLogoOverlay />}
      {/* Navigation Bar */}
      <nav className="w-full flex items-center justify-between px-6 py-4 bg-white/80 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 relative" style={{ height: '40px' }}>
          <a href="/" aria-label="Back to Home" className="mr-2 group">
            <svg className="w-7 h-7 text-purple-500 group-hover:text-purple-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </a>
        </div>
        <div className="flex gap-6 text-gray-700 font-medium">
          <span className="text-purple-600">Dashboard</span>
        </div>
        <div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
        {/* Main large logo at the top */}
        <img src="/logoTransparent.png" alt="Main Logo" className="h-40 w-auto mt-6 mb-8 mx-auto drop-shadow-xl" />
        <Card className="w-full max-w-lg mx-auto mb-8 shadow-2xl rounded-2xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Generate Your Brand Kit</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Place Face2BrandAI.png just above the picture upload tool */}
              <img src="/Face2BrandAI.png" alt="Face2BrandAI Logo" className="h-14 w-auto mb-4 mx-auto drop-shadow" />
              <div className="flex flex-col items-center gap-3">
                {selfiePreview ? (
                  <div className="relative group">
                    <img src={selfiePreview} alt="Selfie Preview" className="w-32 h-32 object-cover rounded-full border-2 border-purple-200 shadow-md hover:shadow-lg transition-all duration-200" />
                    <button type="button" onClick={removeSelfie} className="absolute top-0 right-0 bg-white/80 rounded-full p-1 shadow hover:bg-red-100 transition-colors" aria-label="Remove selfie">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <label htmlFor="selfie-upload" className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-purple-200 rounded-full bg-purple-50 cursor-pointer hover:bg-purple-100 transition-all duration-200">
                    <img src="/selfie-icon.png" alt="Selfie Icon" className="w-10 h-10" />
                    <input id="selfie-upload" type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={handleSelfieChange} aria-label="Upload selfie" />
                  </label>
                )}
                <span className="text-xs text-gray-400 text-center mt-1">Your selfie is processed securely and never stored permanently.</span>
              </div>
              <Input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="h-12" required />
              <Textarea placeholder="Your Vision or Goal" value={vision} onChange={e => setVision(e.target.value)} className="min-h-16" required />
              <Input placeholder="Expression or Personality Trait" value={expression} onChange={e => setExpression(e.target.value)} className="h-12" required />
              {error && <div className="text-red-500 text-sm animate-bounce animate-fade-in">{error}</div>}
              <Button type="submit" className="w-full gradient-brand text-white font-bold h-12" disabled={loading}>{loading ? 'Generating...' : 'Generate Brand Kit'}</Button>
            </form>
          </CardContent>
        </Card>
        {brandKit && (
          <Card className="w-full max-w-lg mx-auto mt-4 animate-fade-in shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-purple-700">Your Brand Kit</CardTitle>
              <Button variant="outline" size="sm" onClick={handleNewKit} className="ml-2">New Brand Kit</Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><span className="font-semibold">Brand Name:</span> {brandKit.brandName}</div>
              <div><span className="font-semibold">Tagline:</span> {brandKit.tagline}</div>
              <div><span className="font-semibold">Font Pairing:</span> {Array.isArray(brandKit.fontPairing) ? brandKit.fontPairing.join(', ') : brandKit.fontPairing}</div>
              <div><span className="font-semibold">Color Palette:</span> {typeof brandKit.colorPalette === 'string' ? brandKit.colorPalette : Array.isArray(brandKit.colorPalette) ? brandKit.colorPalette.map((c: string, i: number) => <span key={i} className="inline-block w-6 h-6 rounded-full mr-1" style={{ background: c }} title={c}></span>) : brandKit.colorPalette && typeof brandKit.colorPalette === 'object' ? Object.entries(brandKit.colorPalette).map(([name, color], i) => <span key={i} className="inline-block w-6 h-6 rounded-full mr-1" style={{ background: color }} title={`${name}: ${color}`}></span>) : null}</div>
              <div><span className="font-semibold">Profile Photo Style:</span> {brandKit.profilePhotoStyle}</div>
              <div><span className="font-semibold">Niche:</span> {brandKit.niche}</div>
              <div><span className="font-semibold">Social Bio:</span> {brandKit.socialBio}</div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 