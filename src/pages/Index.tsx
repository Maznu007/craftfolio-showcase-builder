
import React from 'react';
import Navbar from '@/components/Navbar';
import PortfolioExamples from '@/components/PortfolioExamples';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left Side - Hero Text */}
          <div className="flex-1">
            <h1 className="handwritten text-5xl md:text-7xl font-bold leading-tight">
              <div>Craft a</div>
              <div>portfolio</div>
              <div>that makes</div>
              <div>you stand out</div>
            </h1>
            <div className="mt-8">
              <Button 
                className="rounded-full px-8 py-6 text-lg bg-craftfolio-pink text-black hover:bg-opacity-90"
              >
                Get Started
              </Button>
            </div>
          </div>
          
          {/* Right Side - Portfolio Examples */}
          <div className="flex-1 flex justify-center md:justify-end mt-10 md:mt-0">
            <PortfolioExamples />
          </div>
        </div>
      </main>
      
      {/* Footer with basic info - minimal for now */}
      <footer className="bg-white py-6 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 CRAFTFOLIO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
