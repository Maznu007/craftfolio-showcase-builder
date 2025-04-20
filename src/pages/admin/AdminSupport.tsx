
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { MessageSquare } from 'lucide-react';

type UserData = {
  email: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  status: string;
  last_updated: string;
  user?: UserData;
  messages?: {
    id: string;
    message: string;
    timestamp: string;
    sender_id: string;
  }[];
}

const AdminSupport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch all support tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:user_id (
            email
          ),
          messages:support_messages (
            id,
            message,
            timestamp,
            sender_id
          )
        `)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Support Dashboard</h1>
        </div>

        <div className="grid gap-6">
          {tickets?.map((ticket) => (
            <Card key={ticket.id} className="hover:bg-gray-50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Ticket from {ticket.user?.email || 'Unknown User'}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Last updated {formatDistanceToNow(new Date(ticket.last_updated))} ago
                  </p>
                </div>
                <Button
                  onClick={() => navigate(`/help-support?ticket=${ticket.id}`)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Respond
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Separator className="mb-4" />
                <ScrollArea className="h-32">
                  {ticket.messages?.slice(-3).map((message) => (
                    <div
                      key={message.id}
                      className={`mb-2 p-2 rounded-lg ${
                        message.sender_id === ticket.user_id
                          ? 'bg-blue-50 ml-auto max-w-[80%]'
                          : 'bg-gray-50 max-w-[80%]'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(message.timestamp))} ago
                      </span>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
          
          {tickets?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No support tickets available
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
