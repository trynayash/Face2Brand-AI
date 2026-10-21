import React from 'react';

const Footer = () => (
  <footer className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-gray-200 py-8 mt-8">
    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
      <div className="text-sm">
        Built with <img src="/love.png" alt="love" className="h-6 w-6 inline mx-1 align-middle animate-blink-slow" /> <span className="font-bold">Yash Suthar</span> for Google Cloud Community Days 2025
        <span className="ml-2 text-xs">
          <a href="/terms" className="underline hover:text-white transition-colors">Terms & Conditions</a>
        </span>
      </div>
      <div className="flex gap-4">
        <a href="https://github.com/trynayash" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg className="w-6 h-6 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.263.82-.582 0-.288-.012-1.243-.018-2.25-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.404 1.02.004 2.04.137 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.698.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z"/></svg></a>
        <a href="https://x.com/YashVibes1" target="_blank" rel="noopener noreferrer" aria-label="X"><svg className="w-6 h-6 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 00-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.93-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 01-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 010 21.543a13.94 13.94 0 007.548 2.212c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0024 4.557z"/></svg></a>
      </div>
      <div className="text-xs text-gray-400 text-center sm:text-right">This project is a submission to GCCD 2025 and not officially affiliated with Google</div>
    </div>
  </footer>
);

export default Footer; 