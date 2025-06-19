import React from 'react';
import Face2Brand from './Face2Brand';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

const CustomBrandKit = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Back to Home Arrow */}
      <button
        onClick={() => navigate('/')}
        aria-label="Back to Home"
        className="absolute top-6 left-6 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors z-10"
      >
        <svg width="28" height="28" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <Face2Brand customMode />
    </div>
  );
};

export default CustomBrandKit; 