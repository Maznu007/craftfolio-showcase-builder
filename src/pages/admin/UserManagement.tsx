
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUserManagement } from '@/hooks/useUserManagement';
import UserStatsCard from '@/components/admin/users/UserStatsCard';
import UserFilters from '@/components/admin/users/UserFilters';
import UserTable from '@/components/admin/users/UserTable';
import ConfirmationDialog from '@/components/admin/users/ConfirmationDialog';

const UserManagement = () => {
  const {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    actionUser,
    actionType,
    showDialog,
    setShowDialog,
    isDeleting,
    openActionDialog,
    confirmAction
  } = useUserManagement();

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <UserStatsCard users={users} />
        
        <UserFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
        />
        
        <UserTable 
          users={users} 
          loading={loading}
          openActionDialog={openActionDialog}
        />
      </div>
      
      <ConfirmationDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        actionUser={actionUser}
        actionType={actionType}
        isDeleting={isDeleting}
        confirmAction={confirmAction}
      />
    </AdminLayout>
  );
};

export default UserManagement;
