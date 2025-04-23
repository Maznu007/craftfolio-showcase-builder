
import React from 'react';
import Navbar from '@/components/Navbar';
import SupportChat from '@/components/support/SupportChat';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Support Chat</h1>
          <SupportChat />
        </div>
      </main>
    </div>
  );
};

export default Support;
