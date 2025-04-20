
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { MessageSquare, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  status: string;
}

const HelpSupport = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const adminTicketId = searchParams.get('ticket');
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const initializeTicket = async () => {
      try {
        // Check for existing open ticket
        const { data: existingTicket } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'open')
          .single();

        if (existingTicket) {
          setCurrentTicket(existingTicket);
        } else {
          // Create new ticket
          const { data: newTicket, error: ticketError } = await supabase
            .from('support_tickets')
            .insert([{ user_id: user.id }])
            .select()
            .single();

          if (ticketError) throw ticketError;
          setCurrentTicket(newTicket);
        }
      } catch (error) {
        console.error('Error initializing ticket:', error);
        toast({
          title: "Error",
          description: "Could not initialize support ticket",
          variant: "destructive",
        });
      }
    };

    initializeTicket();
  }, [user, navigate, toast]);

  useEffect(() => {
    if (!currentTicket) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('support_messages')
          .select('*')
          .eq('ticket_id', currentTicket.id)
          .order('timestamp', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Could not load messages",
          variant: "destructive",
        });
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('support-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${currentTicket.id}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTicket, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicket || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: currentTicket.id,
          sender_id: user?.id,
          message: newMessage.trim(),
        }]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send message",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg min-h-[600px] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-semibold">Help & Support</h1>
          </div>
          {currentTicket?.status === 'closed' && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              Closed
            </span>
          )}
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex gap-2">
                  <Skeleton className="h-12 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Start your conversation with our support team</p>
                  <p className="text-sm">We typically reply within a few hours</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="break-words">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user?.id
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}>
                        {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button type="submit" disabled={!newMessage.trim()} className="h-auto">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HelpSupport;
