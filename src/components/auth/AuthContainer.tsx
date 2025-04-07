
import React from 'react';

interface AuthContainerProps {
  children: React.ReactNode;
}

const AuthContainer = ({ children }: AuthContainerProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to CRAFTFOLIO</h1>
          <p className="text-muted-foreground mt-2">Create and showcase your portfolio</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthContainer;
