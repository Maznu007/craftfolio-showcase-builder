
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Speaker, Book, DollarSign, Users, ChevronDown, User, Github, Linkedin, Bell, BellDot, ShieldCheck, HelpCircle, Menu, X } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from '@/integrations/supabase/client';
import NotificationItem from './NotificationItem';
import { Tables } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';

export type Notification = Tables<'notifications'>;

const Navbar = () => {
  const { user, signOut, userType, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      refreshUserProfile();
      fetchNotifications();
    }
  }, [location.pathname, user, refreshUserProfile]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      if (data) {
        setNotifications(data);
        const unread = data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0 || unreadCount === 0) return;
    
    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);
        
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);
        
      if (error) throw error;
      
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

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

  const handleSupportAction = () => {
    navigate('/support');
  };
  
  const handleCommunityAction = (action: 'portfolios' | 'groups') => {
    if (action === 'portfolios') {
      navigate('/community');
    } else if (action === 'groups') {
      navigate('/groups');
    }
  };

  return (
    <div className="w-full bg-craftfolio-gray py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <Speaker className="h-6 w-6" />
          <span className="font-bold text-xl tracking-tight">CRAFTFOLIO</span>
        </div>

        {/* Desktop Navigation */}
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

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center space-x-1 nav-link">
                <Users className="h-4 w-4" />
                <span>Community</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="grid gap-2">
                <button 
                  className="font-medium hover:bg-gray-100 p-2 rounded text-left"
                  onClick={() => handleCommunityAction('portfolios')}
                >
                  Portfolios
                </button>
                <button 
                  className="font-medium hover:bg-gray-100 p-2 rounded text-left"
                  onClick={() => handleCommunityAction('groups')}
                >
                  Groups
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <button 
            className="flex items-center space-x-1 nav-link cursor-pointer"
            onClick={handleSupportAction}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Support</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="p-0 md:hidden" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pt-10">
              <div className="flex flex-col gap-6">
                <div className="flex items-center space-x-2">
                  <Speaker className="h-5 w-5" />
                  <span className="font-bold text-lg">CRAFTFOLIO</span>
                </div>
                <div className="space-y-4">
                  {/* Resources dropdown for mobile */}
                  <div className="space-y-3">
                    <div className="font-medium flex items-center">
                      <Book className="h-4 w-4 mr-2" />
                      Resources
                    </div>
                    <div className="pl-6 space-y-2">
                      <button 
                        className="block w-full text-left py-1"
                        onClick={() => {
                          handleResourceAction('templates');
                        }}
                      >
                        Templates
                      </button>
                      <button 
                        className="block w-full text-left py-1"
                        onClick={() => {
                          handleResourceAction('tutorials');
                        }}
                      >
                        Tutorials
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    className="flex items-center space-x-2 font-medium w-full"
                    onClick={() => {
                      scrollToPricing();
                    }}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Pricing</span>
                  </button>
                  
                  {/* Community dropdown for mobile */}
                  <div className="space-y-3">
                    <div className="font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Community
                    </div>
                    <div className="pl-6 space-y-2">
                      <button 
                        className="block w-full text-left py-1"
                        onClick={() => {
                          navigate('/community');
                        }}
                      >
                        Portfolios
                      </button>
                      <button 
                        className="block w-full text-left py-1"
                        onClick={() => {
                          navigate('/groups');
                        }}
                      >
                        Groups
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    className="flex items-center space-x-2 font-medium w-full"
                    onClick={() => {
                      handleSupportAction();
                    }}
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Support</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Notifications */}
          {user && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                >
                  {unreadCount > 0 ? (
                    <BellDot className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-medium">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div>
                      {notifications.map((notification) => (
                        <NotificationItem 
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications yet
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {/* Authentication */}
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
                {userType === 'admin' && (
                  <DropdownMenuItem onSelect={() => navigate('/admin/dashboard')}>
                    <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="text-black hidden sm:flex"
                onClick={() => handleAuthAction('signup')}
              >
                Sign Up
              </Button>
              <Button 
                className="bg-gray-700 hover:bg-gray-800 text-white"
                onClick={() => handleAuthAction('login')}
              >
                {isMobile ? "Login" : "Log In"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
