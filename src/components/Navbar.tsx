
import React from 'react';
import { Button } from './ui/button';
import { Speaker, Book, DollarSign, Users, ChevronDown } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';

const Navbar = () => {
  return (
    <div className="w-full bg-craftfolio-gray py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Speaker className="h-6 w-6" />
          <span className="font-bold text-xl tracking-tight">CRAFTFOLIO</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center space-x-1 nav-link">
                <Book className="h-4 w-4" />
                <span>Resources</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="grid gap-2">
                <div className="font-medium">Resource Library</div>
                <div className="font-medium">Templates</div>
                <div className="font-medium">Tutorials</div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center space-x-1 nav-link">
                <DollarSign className="h-4 w-4" />
                <span>Pricing</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="grid gap-2">
                <div className="font-medium">Free Plan</div>
                <div className="font-medium">Premium Plan</div>
                <div className="font-medium">Enterprise</div>
              </div>
            </PopoverContent>
          </Popover>

          <button className="flex items-center space-x-1 nav-link">
            <Users className="h-4 w-4" />
            <span>Community</span>
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="text-black">Sign Up</Button>
          <Button className="bg-gray-700 hover:bg-gray-800 text-white">Log In</Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
