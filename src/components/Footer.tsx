import React from 'react';
import { Heart, Code } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-900 py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Code className="mr-2 text-blue-500" size={20} />
            <span className="text-white font-bold text-lg">IceLater</span>
          </div>
          
          <div className="text-gray-400 text-sm flex items-center">
            <p>© {currentYear} IceLater. All rights reserved.</p>
            <span className="mx-2">•</span>
            <p className="flex items-center">
              Made with <Heart size={14} className="mx-1 text-red-500" /> and React
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <a href="#home" className="text-gray-400 hover:text-white transition-colors text-sm">
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;