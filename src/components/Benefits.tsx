
import React from 'react';
import { ArrowRight, Rocket, Palette, Github, Linkedin, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Benefits = () => {
  const benefits = [
    {
      icon: <Palette className="h-10 w-10 text-craftfolio-pink mb-4" />,
      title: 'Beautiful Templates',
      description: 'Choose from professionally designed templates that showcase your skills perfectly'
    },
    {
      icon: <Github className="h-10 w-10 text-craftfolio-darkGray mb-4" />,
      title: 'GitHub Integration',
      description: 'Import your projects directly from GitHub with just a few clicks'
    },
    {
      icon: <Linkedin className="h-10 w-10 text-blue-700 mb-4" />,
      title: 'LinkedIn Import',
      description: 'Sync your work experience and skills from your LinkedIn profile'
    },
    {
      icon: <Sparkles className="h-10 w-10 text-amber-500 mb-4" />,
      title: 'Stand Out',
      description: 'Make an impression with a portfolio that showcases your unique talents'
    },
    {
      icon: <Rocket className="h-10 w-10 text-craftfolio-red mb-4" />,
      title: 'Launch Fast',
      description: 'Get your portfolio online in minutes, not days or weeks'
    }
  ];

  return (
    <div className="py-16 px-4 bg-gray-50" id="benefits">
      <div className="text-center mb-12">
        <h2 className="handwritten text-4xl md:text-5xl font-bold mb-4">Why Choose CRAFTFOLIO</h2>
        <p className="text-lg max-w-2xl mx-auto">Create a portfolio that truly represents your skills and experience with our powerful features</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center">{benefit.icon}</div>
              <CardTitle className="text-xl">{benefit.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">{benefit.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-12 text-center">
        <a href="#pricing" className="inline-flex items-center text-lg font-medium text-black hover:text-gray-700">
          Ready to get started? <ArrowRight className="h-5 w-5 ml-2" />
        </a>
      </div>
    </div>
  );
};

export default Benefits;
