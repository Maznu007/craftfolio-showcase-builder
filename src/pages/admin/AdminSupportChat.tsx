
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminSupportChat as SupportChatComponent } from '@/components/admin/AdminSupportChat';

const AdminSupportChat: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Support Chat</h1>
        <SupportChatComponent />
      </div>
    </AdminLayout>
  );
};

export default AdminSupportChat;
