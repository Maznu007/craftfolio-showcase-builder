
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Speaker, Book, DollarSign, Users, ChevronDown, User, Github, Linkedin } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut, userType, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh user profile when navbar mounts or route changes
  useEffect(() => {
    if (user) {
      refreshUserProfile();
    }
  }, [location.pathname, user, refreshUserProfile]);

  const handleAuthAction = (action: 'signup' | 'login') => {
    navigate('/auth', { state: { defaultTab: action } });
  };

  const handleResourceAction = (action: 'templates' | 'tutorials') => {
    if (action === 'templates') {
      navigate('/templates');
    } else if (action === 'tutorials') {
      window.open('https://www.youtube.com/watch?v=jNQXAC9IVRw', '_blank');
    }
  };

  const scrollToPricing = () => {
    if (location.pathname === '/') {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#pricing');
    }
  };

  return (
    <div className="w-full bg-craftfolio-gray py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
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
                <button 
                  className="font-medium hover:bg-gray-100 p-2 rounded text-left"
                  onClick={() => handleResourceAction('templates')}
                >
                  Templates
                </button>
                <button 
                  className="font-medium hover:bg-gray-100 p-2 rounded text-left"
                  onClick={() => handleResourceAction('tutorials')}
                >
                  Tutorials
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <button 
            className="flex items-center space-x-1 nav-link cursor-pointer"
            onClick={scrollToPricing}
          >
            <DollarSign className="h-4 w-4" />
            <span>Pricing</span>
          </button>

          <button className="flex items-center space-x-1 nav-link">
            <Users className="h-4 w-4" />
            <span>Community</span>
          </button>
        </div>

        {/* Auth Buttons or User Menu */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">My Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.email}</span>
                    <span className="text-xs text-muted-foreground capitalize">{userType} Plan</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/profile')}>
                  Profile Settings
                </DropdownMenuItem>
                {userType === 'free' && (
                  <DropdownMenuItem onSelect={() => navigate('/upgrade')}>
                    Upgrade to Premium
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="text-black"
                onClick={() => handleAuthAction('signup')}
              >
                Sign Up
              </Button>
              <Button 
                className="bg-gray-700 hover:bg-gray-800 text-white"
                onClick={() => handleAuthAction('login')}
              >
                Log In
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
