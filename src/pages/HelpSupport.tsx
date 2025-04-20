
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const HelpSupport = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{ 
          user_id: user.id,
          message: message.trim(),
          status: 'open'
        }]);

      if (error) throw error;

      toast({
        title: "Message sent",
        description: "We'll get back to you as soon as possible.",
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending support message:', error);
      toast({
        title: "Error",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          <h1 className="text-2xl font-semibold">Help & Support</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help you today?"
            className="min-h-[120px]"
          />
          <Button type="submit" disabled={!message.trim()}>
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
};

export default HelpSupport;
