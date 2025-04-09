
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Templates = () => {
  const { user } = useAuth();
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
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
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
              <Card key={template.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${template.color}`}>
                <div className="h-48 overflow-hidden bg-gray-200">
                  <img 
                    src={template.image} 
                    alt={`${template.name} template`}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{template.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-black text-white hover:bg-black/80"
                    onClick={handleGetTemplate}
                  >
                    {user ? 'Use Template' : 'Sign Up to Use'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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
