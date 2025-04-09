
import React from 'react';
import { cn } from '@/lib/utils';

interface PortfolioCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
}

const PortfolioCard = ({ title, subtitle, className, style }: PortfolioCardProps) => {
  return (
    <div 
      className={cn(
        "portfolio-card w-64 h-96 flex flex-col justify-end p-6",
        className
      )}
      style={style}
    >
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      {subtitle && <p className="text-sm">{subtitle}</p>}
    </div>
  );
};

const PortfolioExamples = () => {
  return (
    <div className="relative h-[500px] w-full md:w-[500px]">
      {/* Mark Clennon - Red Background */}
      <div className="absolute top-0 right-0 z-30 animate-float" style={{ animationDelay: "0s" }}>
        <PortfolioCard 
          title="MARK CLENNON" 
          subtitle="Photography" 
          className="bg-craftfolio-red text-white"
        />
      </div>
      
      {/* Springer Studios - White Background */}
      <div className="absolute top-20 right-20 z-20 animate-float" style={{ animationDelay: "1s" }}>
        <PortfolioCard 
          title="SPRINGER STUDIOS" 
          subtitle="Design Agency" 
          className="bg-white text-black border border-gray-200"
        />
      </div>
      
      {/* Xe - Dark Gray Background */}
      <div className="absolute top-40 right-40 z-10 animate-float" style={{ animationDelay: "2s" }}>
        <PortfolioCard 
          title="Xe" 
          subtitle="Digital Artist" 
          className="bg-craftfolio-darkGray text-white"
        />
      </div>
    </div>
  );
};

export default PortfolioExamples;
