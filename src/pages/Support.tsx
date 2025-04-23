
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Support = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  // Fetch tickets (open and closed) for the current user
  const { data: tickets = [], isLoading: ticketLoading } = useQuery({
    queryKey: ['user-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, support_messages(*, sender_id)')
        .eq('user_id', user?.id)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get the most recent active ticket (either open or in_progress)
  const activeTicket = tickets.find(ticket => 
    ticket.status === 'open' || ticket.status === 'in_progress'
  );

  // Fetch messages for the active ticket
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['support-messages', activeTicket?.id],
    queryFn: async () => {
      if (!activeTicket?.id) return [];
      
      const { data: messageData, error: messageError } = await supabase
        .from('support_messages')
        .select('*, profiles(display_name)')
        .eq('ticket_id', activeTicket.id)
        .order('timestamp', { ascending: true });

      if (messageError) throw messageError;

      return messageData.map(msg => ({
        ...msg,
        senderName: msg.sender_id === user?.id 
          ? 'You' 
          : msg.profiles?.display_name || 'Support'
      }));
    },
    enabled: !!activeTicket?.id,
  });

  // Create new ticket mutation
  const createTicket = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{ 
          user_id: user?.id, 
          status: 'open',
          last_updated: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
      toast({
        title: "Support ticket created",
        description: "You can now start chatting with our support team.",
      });
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!activeTicket) {
        await createTicket.mutateAsync();
      }

      const { error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: activeTicket?.id,
          sender_id: user?.id,
          message,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ 
        queryKey: ['support-messages', activeTicket?.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-support-tickets'] 
      });
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await sendMessage.mutate(message);
  };

  if (ticketLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-2xl font-bold">Support Chat</h2>
          </div>
          <p className="text-muted-foreground">
            Chat with our support team. We'll get back to you as soon as possible.
          </p>
        </CardHeader>

        <CardContent>
          {/* Ticket History Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Ticket History</h3>
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="flex items-center justify-between bg-muted/30 p-3 rounded-lg"
                >
                  <div>
                    <span className="font-medium">
                      Ticket from {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    <Badge 
                      variant={
                        ticket.status === 'open' ? 'default' : 
                        ticket.status === 'in_progress' ? 'outline' : 'secondary'
                      }
                      className="ml-2"
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Ticket Chat Area */}
          <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto p-4 bg-muted/30 rounded-lg">
            {!activeTicket ? (
              <div className="text-center text-muted-foreground py-8">
                Start a conversation with our support team
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {msg.senderName}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>

        <CardFooter>
          {!activeTicket ? (
            <Button 
              className="w-full" 
              onClick={() => createTicket.mutate()}
              disabled={createTicket.isPending}
            >
              {createTicket.isPending ? "Creating Ticket..." : "Create New Ticket"}
            </Button>
          ) : (
            <form onSubmit={handleSendMessage} className="w-full space-y-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[80px]"
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={!message.trim() || sendMessage.isPending}
              >
                {sendMessage.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Support;
