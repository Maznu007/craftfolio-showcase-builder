
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AdminRouteGuard from '@/components/AdminRouteGuard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Users, FileText, AlertTriangle, 
  Settings, LogOut, ChevronLeft, MessageCircle, Menu 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      active: isActive('/admin/dashboard')
    },
    {
      title: 'User Management',
      icon: Users,
      path: '/admin/users',
      active: isActive('/admin/users')
    },
    {
      title: 'Portfolio Management',
      icon: FileText,
      path: '/admin/portfolios',
      active: isActive('/admin/portfolios')
    },
    {
      title: 'Support',
      icon: MessageCircle,
      path: '/admin/support',
      active: isActive('/admin/support')
    },
    {
      title: 'Reported Content',
      icon: AlertTriangle,
      path: '/admin/reports',
      active: isActive('/admin/reports')
    }
  ];

  const NavigationContent = () => (
    <div className="space-y-1">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path}
          className={cn(
            "flex items-center px-4 py-3 text-sm rounded-md",
            item.active 
              ? "bg-gray-100 text-black font-medium" 
              : "text-gray-600 hover:bg-gray-100 hover:text-black"
          )}
        >
          <item.icon className="h-5 w-5 mr-3" />
          {item.title}
        </Link>
      ))}
    </div>
  );

  return (
    <AdminRouteGuard>
      <div className="flex min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          
          <nav className="flex-1 px-4 pb-4">
            <NavigationContent />
            
            <div className="mt-10 pt-6 border-t border-gray-200 space-y-1">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/dashboard')}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </nav>
        </aside>
        
        {/* Mobile Header and Navigation */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="flex flex-col h-full">
                    <div className="p-4">
                      <h2 className="text-xl font-bold">Admin Panel</h2>
                    </div>
                    <nav className="flex-1 px-2">
                      <NavigationContent />
                    </nav>
                    <div className="p-4 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mb-2" 
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="md:h-full md:overflow-y-auto md:pb-0 pt-20 md:pt-0">
            {children}
          </div>
        </div>
      </div>
    </AdminRouteGuard>
  );
};

export default AdminLayout;
