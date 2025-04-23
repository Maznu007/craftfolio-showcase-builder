
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p>Welcome to the admin dashboard. Use the sidebar to navigate to different admin sections.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
