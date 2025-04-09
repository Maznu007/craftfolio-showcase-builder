
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Templates = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();

  const handleGetTemplate = () => {
    if (user) {
      navigate('/portfolio/create');
    } else {
      navigate('/auth');
    }
  };

  const templateItems = [
    {
      id: 1,
      name: 'Minimal',
      description: 'Clean and simple design perfect for highlighting your work',
      image: '/minimal-template.png',
      color: 'bg-gray-100'
    },
    {
      id: 2,
      name: 'Professional',
      description: 'Polished and structured design for a more corporate look',
      image: '/professional-template.png',
      color: 'bg-blue-50'
    },
    {
      id: 3,
      name: 'Creative',
      description: 'Bold and dynamic layout to showcase creative projects',
      image: '/creative-template.png',
      color: 'bg-pink-50'
    },
    {
      id: 4,
      name: 'Developer',
      description: 'Tech-focused template with GitHub integration',
      image: '/developer-template.png',
      color: 'bg-green-50'
    },
    {
      id: 5,
      name: 'Premium Modern',
      description: 'Sleek and contemporary design with advanced layout options',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
      color: 'bg-indigo-50',
      premium: true
    },
    {
      id: 6,
      name: 'Premium Creative',
      description: 'Artistic and unique design with custom animations',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
      color: 'bg-rose-50',
      premium: true
    },
    {
      id: 7,
      name: 'Premium Executive',
      description: 'Elegant design for professionals and executives',
      image: '/lovable-uploads/ccc7de5f-a1cc-48ae-83b5-bc57227b86d6.png',
      color: 'bg-amber-50',
      premium: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="handwritten text-4xl md:text-5xl font-bold mb-4">
              Our Portfolio Templates
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our professionally designed templates to create your perfect portfolio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templateItems.map((template) => (
              <Card 
                key={template.id} 
                className={`overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${template.color} ${template.premium ? 'border-2 border-yellow-300' : ''}`}
              >
                <div className="h-48 overflow-hidden bg-gray-200 relative">
                  <img 
                    src={template.image} 
                    alt={`${template.name} template`}
                    className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {template.premium && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-black font-semibold py-1 px-3 rounded-bl-lg flex items-center">
                      <Crown className="h-4 w-4 mr-1" />
                      <span>Premium</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    {template.premium && userType !== 'premium' && (
                      <Lock className="h-4 w-4 text-gray-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{template.description}</p>
                  {template.premium && (
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Star className="h-3 w-3 mr-1 inline" /> Premium Feature
                      </Badge>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      template.premium 
                        ? userType === 'premium' 
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-600' 
                          : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-black/80'
                    }`}
                    onClick={handleGetTemplate}
                    disabled={template.premium && userType !== 'premium'}
                  >
                    {user 
                      ? template.premium && userType !== 'premium' 
                        ? 'Premium Only' 
                        : 'Use Template' 
                      : 'Sign Up to Use'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {userType !== 'premium' && (
            <div className="mt-16 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 max-w-3xl mx-auto shadow-md">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <Crown className="h-16 w-16 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-yellow-800 mb-2">Unlock Premium Templates</h3>
                  <p className="text-yellow-700 mb-4">
                    Upgrade to a premium account to access our exclusive templates with advanced features, unique designs, and priority support.
                  </p>
                  <Button 
                    variant="outline" 
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-600 border-none"
                    onClick={() => navigate('/upgrade')}
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">© 2025 CRAFTFOLIO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Templates;
