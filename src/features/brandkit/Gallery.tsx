import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface BrandKit {
  id: string;
  brandName: string;
  tagline: string;
}

const Gallery = () => {
  const [kits, setKits] = useState<BrandKit[]>([]);

  useEffect(() => {
    const publicKits = JSON.parse(localStorage.getItem('publicBrandKits') || '[]');
    setKits(publicKits);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Public Brand Kit Gallery</h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {kits.length === 0 && <div className="col-span-full text-center text-gray-500">No public kits yet.</div>}
        {kits.map((kit: BrandKit) => (
          <Card key={kit.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="text-xl">{kit.brandName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic mb-2">{kit.tagline}</p>
              <Link to={`/kit/${kit.id}`} className="text-purple-600 hover:underline">View Kit</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Gallery; 