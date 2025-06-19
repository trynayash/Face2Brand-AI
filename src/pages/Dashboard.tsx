import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [kits, setKits] = useState([]);

  useEffect(() => {
    const userKits = JSON.parse(localStorage.getItem('userBrandKits') || '[]');
    setKits(userKits);
  }, []);

  const handleDelete = (id: string) => {
    const updated = kits.filter((k: any) => k.id !== id);
    setKits(updated);
    localStorage.setItem('userBrandKits', JSON.stringify(updated));
  };

  const handleDownload = (kit: any) => {
    // Placeholder for PDF download logic
    alert('PDF download coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Your Brand Kits</h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {kits.length === 0 && <div className="col-span-full text-center text-gray-500">No kits yet.</div>}
        {kits.map((kit: any) => (
          <Card key={kit.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">{kit.brandName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic mb-2">{kit.tagline}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.open(`/kit/${kit.id}`, '_blank')}>View</Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(kit)}>Download PDF</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(kit.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 