
import React from 'react';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check } from 'lucide-react';
import { Notification } from './Navbar';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };
  
  return (
    <div 
      className={`p-3 border-b flex gap-3 ${!notification.is_read ? 'bg-blue-50' : ''}`}
      onClick={handleMarkAsRead}
    >
      <div className={`p-2 rounded-full ${!notification.is_read ? 'bg-blue-100' : 'bg-gray-100'}`}>
        <Bell className="h-4 w-4 text-gray-700" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          {!notification.is_read && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={handleMarkAsRead}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Mark as read</span>
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>
    </div>
  );
};

export default NotificationItem;
