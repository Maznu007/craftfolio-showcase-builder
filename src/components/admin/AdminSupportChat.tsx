
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  user_id: string;
  admin_id: string | null;
  status: string;
  created_at: string;
  last_updated: string;
}

export const AdminSupportChat = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
    const channel = supabase
      .channel('admin-support')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      const channel = supabase
        .channel(`ticket-${selectedTicket.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: `ticket_id=eq.${selectedTicket.id}`
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages(prev => [...prev, newMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load support tickets"
      });
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
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
    if (!newMessage.trim() || !selectedTicket || !user) return;

    setSending(true);
    try {
      // First, update the ticket status if needed
      if (!selectedTicket.admin_id || selectedTicket.status === 'open') {
        const { error: updateError } = await supabase
          .from('support_tickets')
          .update({ 
            admin_id: user.id,
            status: 'in_progress'
          })
          .eq('id', selectedTicket.id);

        if (updateError) {
          console.error('Error updating ticket:', updateError);
          throw updateError;
        }
        
        // Update local state
        setSelectedTicket({
          ...selectedTicket,
          admin_id: user.id,
          status: 'in_progress'
        });
      }

      // Now send the message
      const { error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          message: newMessage.trim()
        }]);

      if (error) throw error;
      
      // Update the ticket's last_updated timestamp manually
      // This is in case the trigger doesn't fire properly
      const { error: timestampError } = await supabase
        .from('support_tickets')
        .update({ last_updated: new Date().toISOString() })
        .eq('id', selectedTicket.id);
        
      if (timestampError) console.error('Error updating timestamp:', timestampError);

      setNewMessage('');
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

  const closeTicket = async () => {
    if (!selectedTicket) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', selectedTicket.id);

      if (error) throw error;
      
      setSelectedTicket({
        ...selectedTicket,
        status: 'closed'
      });
      
      toast({
        title: "Ticket closed",
        description: "The support ticket has been closed"
      });
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not close ticket"
      });
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
    <div className="grid grid-cols-3 gap-6 h-[800px]">
      <Card className="col-span-1 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Support Tickets</h3>
        </div>
        <ScrollArea className="flex-1">
          {tickets.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No support tickets found
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedTicket?.id === ticket.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ticket #{ticket.id.slice(0, 8)}</span>
                  <Badge
                    variant={
                      ticket.status === 'open'
                        ? 'default'
                        : ticket.status === 'in_progress'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {ticket.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(ticket.last_updated).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </ScrollArea>
      </Card>

      <Card className="col-span-2 flex flex-col">
        {selectedTicket ? (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-semibold">
                  Ticket #{selectedTicket.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>
              {selectedTicket.status !== 'closed' && (
                <Button
                  variant="outline"
                  onClick={closeTicket}
                >
                  Close Ticket
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
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
                  ))
                )}
              </div>
            </ScrollArea>

            {selectedTicket.status !== 'closed' && (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
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
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a ticket to view the conversation
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminSupportChat;
