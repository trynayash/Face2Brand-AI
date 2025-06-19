import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';

interface BrandKit {
  id: string;
  brandName: string;
  colorPalette: string;
  personalityTraits: string;
  tagline: string;
  profilePhotoStyle: string;
  usernameSuggestions: string;
  bio: string;
  contentIdeas: string;
}

const PublicKit = () => {
  const { id } = useParams();
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Try to fetch from localStorage (for demo); replace with Supabase fetch for production
    const kits = JSON.parse(localStorage.getItem('publicBrandKits') || '[]');
    const found = kits.find((k: BrandKit) => k.id === id);
    if (found) setKit(found);
    else setNotFound(true);
  }, [id]);

  if (notFound) return <div className="min-h-screen flex items-center justify-center text-2xl">Brand kit not found.</div>;
  if (!kit) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in max-w-2xl w-full mx-auto mt-12">
        <CardHeader>
          <CardTitle className="text-2xl">{kit.brandName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="colorPalette">
              <AccordionTrigger>Color Palette</AccordionTrigger>
              <AccordionContent>{kit.colorPalette}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="personalityTraits">
              <AccordionTrigger>Personality Traits</AccordionTrigger>
              <AccordionContent>{kit.personalityTraits}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="tagline">
              <AccordionTrigger>Tagline</AccordionTrigger>
              <AccordionContent><span className="italic">"{kit.tagline}"</span></AccordionContent>
            </AccordionItem>
            <AccordionItem value="profilePhotoStyle">
              <AccordionTrigger>Profile Photo Style</AccordionTrigger>
              <AccordionContent>{kit.profilePhotoStyle}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="usernameSuggestions">
              <AccordionTrigger>Username Suggestions</AccordionTrigger>
              <AccordionContent>{kit.usernameSuggestions}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="bio">
              <AccordionTrigger>Bio</AccordionTrigger>
              <AccordionContent>{kit.bio}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="contentIdeas">
              <AccordionTrigger>Content Ideas</AccordionTrigger>
              <AccordionContent>{kit.contentIdeas}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicKit; 