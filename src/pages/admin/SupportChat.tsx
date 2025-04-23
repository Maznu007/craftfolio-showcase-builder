
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type UserInfo = {
  id: string;
  email?: string;
  displayName?: string;
}

type TicketWithUser = {
  id: string;
  user_id: string;
  admin_id: string | null;
  status: string;
  created_at: string;
  last_updated: string;
  userInfo?: UserInfo;
}

type MessageWithSender = {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  timestamp: string;
  senderName?: string;
}

const SupportChat = () => {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  // Fetch all tickets and include user information
  const { data: tickets = [] } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      // First get all tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('last_updated', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Get user information for all tickets
      const userIds = ticketsData.map(ticket => ticket.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge ticket data with user information
      const ticketsWithUserInfo: TicketWithUser[] = ticketsData.map(ticket => {
        const userProfile = profilesData.find(profile => profile.id === ticket.user_id);
        return {
          ...ticket,
          userInfo: {
            id: ticket.user_id,
            email: userProfile?.email,
            displayName: userProfile?.display_name
          }
        };
      });

      return ticketsWithUserInfo;
    },
  });

  // Fetch messages for selected ticket
  const { data: messages = [] } = useQuery({
    queryKey: ['support-messages', selectedTicket],
    queryFn: async () => {
      if (!selectedTicket) return [];
      
      // Get messages for the selected ticket
      const { data: messagesData, error: messagesError } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', selectedTicket)
        .order('timestamp', { ascending: true });

      if (messagesError) throw messagesError;

      // Get profiles for all senders
      const senderIds = messagesData.map(message => message.sender_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', senderIds);

      if (profilesError) throw profilesError;

      // Merge message data with sender information
      const messagesWithSenders: MessageWithSender[] = messagesData.map(message => {
        const senderProfile = profilesData.find(profile => profile.id === message.sender_id);
        return {
          ...message,
          senderName: senderProfile?.display_name || 'Unknown'
        };
      });

      return messagesWithSenders;
    },
    enabled: !!selectedTicket,
  });

  // Assign admin to ticket mutation
  const assignTicket = useMutation({
    mutationFn: async () => {
      if (!selectedTicket || !user) return;

      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          admin_id: user.id,
          status: 'in_progress'
        })
        .eq('id', selectedTicket);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: "Ticket assigned",
        description: "You have been assigned to this support ticket.",
      });
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const { error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: selectedTicket,
          sender_id: user?.id,
          message,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['support-messages'] });
    },
  });

  // Close ticket mutation
  const closeTicket = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', selectedTicket);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setSelectedTicket(null);
      toast({
        title: "Ticket closed",
        description: "The support ticket has been closed successfully.",
      });
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedTicket) return;
    sendMessage.mutate(message);
  };

  return (
    <AdminLayout>
      <div className="container p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tickets List */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Support Tickets</h2>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        {ticket.userInfo?.displayName || ticket.userInfo?.email || 'Unknown User'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.status === 'open' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.last_updated).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket.id)}
                          disabled={ticket.status === 'closed'}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Chat</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto p-4 bg-muted/30 rounded-lg">
                {!selectedTicket ? (
                  <div className="text-center text-muted-foreground py-8">
                    Select a ticket to view the conversation
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
                          {msg.sender_id === user?.id ? 'You (Support)' : msg.senderName || 'User'}
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
              {selectedTicket && (
                <form onSubmit={handleSendMessage} className="w-full space-y-2">
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => assignTicket.mutate()}
                      disabled={assignTicket.isPending}
                    >
                      Assign to Me
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => closeTicket.mutate()}
                      disabled={closeTicket.isPending}
                    >
                      Close Ticket
                    </Button>
                  </div>
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
      </div>
    </AdminLayout>
  );
};

export default SupportChat;
