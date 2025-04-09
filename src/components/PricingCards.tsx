
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const PricingCards = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();

  const handlePricingAction = (plan: 'free' | 'premium') => {
    if (!user) {
      navigate('/auth');
    } else if (plan === 'premium' && userType === 'free') {
      navigate('/upgrade');
    }
  };

  return (
    <div className="py-16 px-4" id="pricing">
      <div className="text-center mb-12">
        <h2 className="handwritten text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-lg">Select the perfect plan for your needs</p>
      </div>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <Card className="border-2 border-gray-200 flex flex-col">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Free</CardTitle>
            <div className="mt-4 text-4xl font-bold">$0<span className="text-lg font-normal text-gray-500">/month</span></div>
            <CardDescription className="mt-3">For individuals just getting started</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>1 portfolio site</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Basic templates</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>GitHub integration</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Custom domain (with Craftfolio badge)</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-craftfolio-gray text-black hover:bg-gray-300" 
              onClick={() => handlePricingAction('free')}
            >
              {!user ? 'Sign Up Free' : userType === 'free' ? 'Current Plan' : 'Downgrade'}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="border-2 border-black flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-craftfolio-red text-white px-3 py-1 text-sm font-medium">
            POPULAR
          </div>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Premium</CardTitle>
            <div className="mt-4 text-4xl font-bold">$9<span className="text-lg font-normal text-gray-500">/month</span></div>
            <CardDescription className="mt-3">For professionals and serious creatives</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Unlimited portfolio sites</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>All premium templates</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>GitHub & LinkedIn integration</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Custom domain (no badge)</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>SEO optimization tools</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Priority support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-black text-white hover:bg-black/80" 
              onClick={() => handlePricingAction('premium')}
            >
              {!user ? 'Get Started' : userType === 'premium' ? 'Current Plan' : 'Upgrade'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PricingCards;
