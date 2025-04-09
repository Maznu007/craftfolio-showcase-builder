
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
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Left Side - Hero Text */}
            <div className="flex-1">
              <h1 className="handwritten text-5xl md:text-7xl font-bold leading-tight">
                <div>Craft a</div>
                <div>portfolio</div>
                <div>that makes</div>
                <div>you stand out</div>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                Create stunning, professional portfolios in minutes. Import your projects from GitHub, 
                showcase your skills, and get noticed by potential employers or clients.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button 
                  className="rounded-full px-8 py-6 text-lg bg-craftfolio-pink text-black hover:bg-opacity-90"
                  onClick={handleCTA}
                >
                  {user ? 'Go to Dashboard' : 'Get Started'}
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full px-8 py-6 text-lg border-black text-black hover:bg-gray-100"
                  onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Right Side - Portfolio Examples */}
            <div className="flex-1 flex justify-center md:justify-end mt-10 md:mt-0">
              <PortfolioExamples />
            </div>
          </div>
        </div>
        
        {/* Benefits Section */}
        <Benefits />
        
        {/* Pricing Section */}
        <PricingCards />
        
        {/* FAQ Section */}
        <FAQ />
      </main>
      
      {/* Footer with basic info - minimal for now */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CRAFTFOLIO</h3>
              <p className="text-gray-600">Craft a portfolio that makes you stand out from the crowd.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:underline">Templates</a></li>
                <li><a href="#" className="hover:underline">Tutorials</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline">Terms of Service</a></li>
                <li><a href="#" className="hover:underline">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
            <p>© 2025 CRAFTFOLIO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
