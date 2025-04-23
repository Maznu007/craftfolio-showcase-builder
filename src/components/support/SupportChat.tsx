
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { SendHorizontal, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  status: string;
  admin_id: string | null;
  created_at: string;
  last_updated: string;
}

export const SupportChat = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchOrCreateTicket();
    const setupRealtimeSubscription = () => {
      const channel = supabase
        .channel('support-chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: ticket ? `ticket_id=eq.${ticket.id}` : undefined,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) => [...prev, newMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    if (ticket) {
      setupRealtimeSubscription();
      fetchMessages();
    }
  }, [ticket?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchOrCreateTicket = async () => {
    try {
      // First try to fetch an existing open ticket
      let { data: existingTicket } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'open')
        .single();

      if (!existingTicket) {
        // If no open ticket exists, create a new one
        const { data: newTicket, error: createError } = await supabase
          .from('support_tickets')
          .insert([{ user_id: user?.id }])
          .select()
          .single();

        if (createError) throw createError;
        existingTicket = newTicket;
      }

      setTicket(existingTicket);
    } catch (error) {
      console.error('Error fetching/creating ticket:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not initialize support chat"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!ticket) return;

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load messages"
      });
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !ticket || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: ticket.id,
          sender_id: user.id,
          message: message.trim()
        }]);

      if (error) throw error;
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send message"
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Support Chat</h2>
        <p className="text-sm text-muted-foreground">
          {ticket?.status === 'open' ? 'Waiting for admin response...' : 'Chat with support'}
        </p>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <span className="text-xs opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            onClick={sendMessage} 
            disabled={sending || !message.trim()}
            className="px-4"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SupportChat;
