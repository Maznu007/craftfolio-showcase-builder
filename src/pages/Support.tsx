import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Support = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  const activeTicket = tickets.find(ticket => 
    ticket.status === 'open' || ticket.status === 'in_progress'
  );

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['support-messages', activeTicket?.id],
    queryFn: async () => {
      if (!activeTicket?.id) return [];
      
      const { data: messageData, error: messageError } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', activeTicket.id)
        .order('timestamp', { ascending: true });

      if (messageError) throw messageError;
      
      const senderIds = messageData.map(msg => msg.sender_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', senderIds);
      
      if (profilesError) throw profilesError;

      return messageData.map(msg => {
        const senderProfile = profilesData?.find(profile => profile.id === msg.sender_id);
        return {
          ...msg,
          senderName: msg.sender_id === user?.id 
            ? 'You' 
            : senderProfile?.display_name || 'Support'
        };
      });
    },
    enabled: !!activeTicket?.id,
  });

  const { data: selectedTicketMessages = [] } = useQuery({
    queryKey: ['support-messages', selectedTicketId],
    queryFn: async () => {
      if (!selectedTicketId) return [];
      
      const { data: messageData, error: messageError } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', selectedTicketId)
        .order('timestamp', { ascending: true });

      if (messageError) throw messageError;
      
      const senderIds = messageData.map(msg => msg.sender_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', senderIds);
      
      if (profilesError) throw profilesError;

      return messageData.map(msg => {
        const senderProfile = profilesData?.find(profile => profile.id === msg.sender_id);
        return {
          ...msg,
          senderName: msg.sender_id === user?.id 
            ? 'You' 
            : senderProfile?.display_name || 'Support'
        };
      });
    },
    enabled: !!selectedTicketId,
  });

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

      await supabase
        .from('support_tickets')
        .update({ last_updated: new Date().toISOString() })
        .eq('id', activeTicket?.id);
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

  useEffect(() => {
    const channel = supabase
      .channel('support-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: activeTicket ? `ticket_id=eq.${activeTicket.id}` : undefined,
        },
        (payload) => {
          if (payload.new && payload.new.sender_id !== user?.id) {
            queryClient.invalidateQueries({ queryKey: ['support-messages', activeTicket?.id] });
            queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
            toast({
              title: "New support message",
              description: "You have received a new reply from support.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTicket?.id, queryClient, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await sendMessage.mutate(message);
  };

  const handleViewHistory = (ticketId: string) => {
    setSelectedTicketId(ticketId);
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
            <h2 className="text-xl sm:text-2xl font-bold">Support Chat</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Chat with our support team. We'll get back to you as soon as possible.
          </p>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Ticket History</h3>
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/30 p-3 rounded-lg cursor-pointer hover:bg-muted/50 gap-2 sm:gap-0"
                  onClick={() => handleViewHistory(ticket.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-medium text-sm sm:text-base">
                      Ticket from {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    <Badge 
                      variant={
                        ticket.status === 'open' ? 'default' : 
                        ticket.status === 'in_progress' ? 'outline' : 'secondary'
                      }
                      className="w-fit"
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                    View History
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {!activeTicket ? (
            <div className="text-center text-muted-foreground py-8 text-sm sm:text-base">
              Start a conversation with our support team
            </div>
          ) : (
            <div className="space-y-4 min-h-[300px] max-h-[400px] sm:max-h-[500px] overflow-y-auto p-3 sm:p-4 bg-muted/30 rounded-lg">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-3 ${
                      msg.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-medium mb-1">{msg.senderName}</p>
                    <p className="text-sm sm:text-base break-words">{msg.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2">
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
                className="min-h-[80px] text-sm sm:text-base"
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

      <Dialog open={!!selectedTicketId} onOpenChange={() => setSelectedTicketId(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Conversation History</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedTicketMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-3 ${
                    msg.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-medium mb-1">{msg.senderName}</p>
                  <p className="text-sm sm:text-base break-words">{msg.message}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
