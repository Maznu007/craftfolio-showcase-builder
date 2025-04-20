
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  SidebarProvider,
  SidebarMenuButton, 
  SidebarMenuItem 
} from './ui/sidebar';

const SupportMenuItem = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => navigate('/help-support')}
          tooltip="Help & Support"
        >
          <MessageSquare />
          <span>Help & Support</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarProvider>
  );
};

export default SupportMenuItem;
