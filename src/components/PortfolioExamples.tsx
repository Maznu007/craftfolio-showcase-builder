
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

const ResumeTemplateShowcase = () => {
  const templates = [
    {
      id: 1,
      name: "Professional",
      image: "/lovable-uploads/db5c3197-004f-4e16-b9ba-336557e2f1de.png",
      style: "bg-white shadow-lg"
    },
    {
      id: 2,
      name: "Modern",
      image: "/minimal-template.png",
      style: "bg-gray-50 shadow-lg"
    },
    {
      id: 3,
      name: "Creative",
      image: "/creative-template.png",
      style: "bg-craftfolio-mint shadow-lg"
    }
  ];

  return (
    <div className="w-full md:w-[600px]">
      <Carousel className="w-full">
        <CarouselContent>
          {templates.map((template) => (
            <CarouselItem key={template.id} className="md:basis-1/1">
              <div className="p-1">
                <Card className={cn("overflow-hidden rounded-xl", template.style)}>
                  <CardContent className="flex aspect-square items-center justify-center p-2">
                    <img 
                      src={template.image} 
                      alt={`${template.name} resume template`} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};

export default ResumeTemplateShowcase;
