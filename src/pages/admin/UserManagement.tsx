
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserData } from '@/types/admin';
import UserStatsCard from '@/components/admin/users/UserStatsCard';
import UserFilters from '@/components/admin/users/UserFilters';
import UserTable from '@/components/admin/users/UserTable';
import ConfirmationDialog from '@/components/admin/users/ConfirmationDialog';

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [actionUser, setActionUser] = useState<UserData | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching all user profiles...');
      // Get all profiles including user_type, not filtering by type
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, user_type, created_at, email');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Fetched profiles:', profiles?.length || 0, 'profiles');
      
      if (!profiles || profiles.length === 0) {
        console.log('No profiles found!');
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // For each profile, count portfolios and get additional data
      const usersWithDetails = await Promise.all(
        profiles.map(async (profile) => {
          // Get portfolio count
          const { count: portfolioCount, error: countError } = await supabase
            .from('portfolios')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          if (countError) {
            console.error('Error counting portfolios for user', profile.id, ':', countError);
          }
          
          // For last sign in, we can't directly access the auth.users table with this token,
          // so we'll just use a placeholder or null for now
          return {
            ...profile,
            email: profile.email || 'User ' + profile.id.substring(0, 8),
            last_sign_in_at: null, // We'll need admin access for this
            portfolio_count: portfolioCount || 0,
            // Ensure user_type is normalized to one of the expected values
            user_type: (profile.user_type && ['free', 'premium', 'admin'].includes(profile.user_type.toLowerCase())) 
              ? profile.user_type.toLowerCase() as 'free' | 'premium' | 'admin'
              : 'free'
          };
        })
      );
      
      console.log('Processed users:', usersWithDetails.length, 'users with details');
      setUsers(usersWithDetails as UserData[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: "There was a problem fetching user data."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { data, error } = await supabase
        .rpc('update_user_role', { 
          user_id: userId, 
          new_role: newRole 
        });
      
      if (error) throw error;
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, user_type: newRole as 'free' | 'premium' | 'admin' } 
            : user
        )
      );
      
      toast({
        title: "User role updated",
        description: `User has been updated to ${newRole}`
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: "There was a problem updating the user role."
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsDeleting(true);
      
      // Delete profile (this will cascade to other data thanks to RLS)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state by removing the deleted user
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: "User deleted",
        description: "The user has been permanently deleted."
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete user",
        description: "There was a problem deleting the user."
      });
    } finally {
      setIsDeleting(false);
      setShowDialog(false);
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "A password reset link has been sent to the user's email."
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        variant: "destructive",
        title: "Failed to send password reset",
        description: "There was a problem sending the password reset email."
      });
    }
  };

  const openActionDialog = (user: UserData, action: string) => {
    setActionUser(user);
    setActionType(action);
    setShowDialog(true);
  };

  const confirmAction = () => {
    if (!actionUser || !actionType) return;
    
    switch (actionType) {
      case 'make-admin':
        handleRoleChange(actionUser.id, 'admin');
        break;
      case 'make-premium':
        handleRoleChange(actionUser.id, 'premium');
        break;
      case 'make-free':
        handleRoleChange(actionUser.id, 'free');
        break;
      case 'delete':
        handleDeleteUser(actionUser.id);
        break;
      case 'reset-password':
        handleSendPasswordReset(actionUser.email);
        break;
      default:
        break;
    }
    
    if (actionType !== 'delete') { // For delete, we close in the handleDeleteUser function
      setShowDialog(false);
    }
    
    setActionUser(null);
    setActionType(null);
  };

  const filteredUsers = users.filter(user => {
    // Apply search filter
    const matchesSearch = searchQuery === '' || 
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply role filter
    const matchesRole = !filterRole || user.user_type === filterRole;
    
    return matchesSearch && matchesRole;
  });

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
          users={filteredUsers} 
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
