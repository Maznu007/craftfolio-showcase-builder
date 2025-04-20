
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider 
} from './ui/sidebar';

const SupportMenuItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkUnreadMessages = async () => {
      const { data: ticket } = await supabase
        .from('support_tickets')
        .select('id, last_updated')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (ticket) {
        const { data: messages } = await supabase
          .from('support_messages')
          .select('sender_id')
          .eq('ticket_id', ticket.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        setHasUnread(messages?.sender_id !== user.id);
      }
    };

    checkUnreadMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('support-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
        },
        (payload: any) => {
          if (payload.new.sender_id !== user.id) {
            setHasUnread(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Wrap with SidebarProvider to make useSidebar accessible
  return (
    <SidebarProvider>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            setHasUnread(false);
            navigate('/help-support');
          }}
          className="relative"
        >
          <MessageSquare />
          <span>Help & Support</span>
          {hasUnread && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarProvider>
  );
};

export default SupportMenuItem;
