
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import PortfolioExamples from '@/components/PortfolioExamples';
import Benefits from '@/components/Benefits';
import PricingCards from '@/components/PricingCards';
import FAQ from '@/components/FAQ';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Left Side - Hero Text */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="handwritten text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                <div>Craft a</div>
                <div>portfolio</div>
                <div>that makes</div>
                <div>you stand out</div>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
                Create stunning, professional portfolios in minutes. Import your projects from GitHub, 
                showcase your skills, and get noticed by potential employers or clients.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  className="rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg bg-craftfolio-pink text-black hover:bg-opacity-90 w-full sm:w-auto"
                  onClick={handleCTA}
                >
                  {user ? 'Go to Dashboard' : 'Get Started'}
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg border-black text-black hover:bg-gray-100 w-full sm:w-auto"
                  onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Right Side - Portfolio Examples */}
            <div className="flex-1 w-full lg:w-auto">
              <PortfolioExamples />
            </div>
          </div>
        </div>
        
        <Benefits />
        <PricingCards />
        <FAQ />
      </main>
      
      <footer className="bg-white border-t py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold text-lg mb-3 sm:mb-4">CRAFTFOLIO</h3>
              <p className="text-gray-600 text-sm sm:text-base">Craft a portfolio that makes you stand out from the crowd.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 sm:mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                <li><a href="#" className="hover:underline">Templates</a></li>
                <li><a href="#" className="hover:underline">Tutorials</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 sm:mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline">Terms of Service</a></li>
                <li><a href="#" className="hover:underline">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-gray-500">
            <p>© 2025 CRAFTFOLIO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
