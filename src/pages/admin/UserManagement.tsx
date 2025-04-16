
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, UserCog, ShieldAlert, Shield, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, Trash2, MailPlus, Search, Crown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface UserData {
  id: string;
  email: string;
  display_name: string | null;
  user_type: 'free' | 'premium' | 'admin';
  last_sign_in_at: string | null;
  created_at: string;
  portfolio_count: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [actionUser, setActionUser] = useState<UserData | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get users from auth.users - we can't query this directly with RLS
      // Instead we'll query the profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, user_type, created_at');
      
      if (profilesError) throw profilesError;
      
      // For each profile, count portfolios
      const usersWithDetails = await Promise.all(
        profiles.map(async (profile) => {
          // Get portfolio count
          const { count: portfolioCount, error: countError } = await supabase
            .from('portfolios')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          if (countError) {
            console.error('Error counting portfolios:', countError);
            return {
              ...profile,
              email: 'Unknown',  // We don't have direct access to email
              last_sign_in_at: null,
              portfolio_count: 0,
              user_type: profile.user_type as 'free' | 'premium' | 'admin'
            };
          }
          
          return {
            ...profile,
            email: 'User ' + profile.id.substring(0, 8),  // Anonymized for display
            last_sign_in_at: null,  // We don't have this data from profiles
            portfolio_count: portfolioCount || 0,
            user_type: profile.user_type as 'free' | 'premium' | 'admin'
          };
        })
      );
      
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
    // In a real app, you would implement user deletion here
    // For now, we'll just show a toast message
    toast({
      title: "User deletion",
      description: "This feature is not fully implemented yet."
    });
  };

  const handleSendPasswordReset = async (userId: string) => {
    // In a real app, you would implement password reset here
    // For now, we'll just show a toast message
    toast({
      title: "Password reset",
      description: "This feature is not fully implemented yet."
    });
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
        handleSendPasswordReset(actionUser.id);
        break;
      default:
        break;
    }
    
    setShowDialog(false);
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

  const getActionTitle = () => {
    if (!actionType || !actionUser) return '';
    
    switch (actionType) {
      case 'make-admin':
        return `Make "${actionUser.email}" an admin?`;
      case 'make-premium':
        return `Upgrade "${actionUser.email}" to premium?`;
      case 'make-free':
        return `Downgrade "${actionUser.email}" to free?`;
      case 'delete':
        return `Delete user "${actionUser.email}"?`;
      case 'reset-password':
        return `Send password reset to "${actionUser.email}"?`;
      default:
        return '';
    }
  };

  const getActionDescription = () => {
    if (!actionType) return '';
    
    switch (actionType) {
      case 'make-admin':
        return 'This will give the user full administrative access to the platform.';
      case 'make-premium':
        return 'This will upgrade the user to premium status with all premium features.';
      case 'make-free':
        return 'This will downgrade the user to free status, removing premium features.';
      case 'delete':
        return 'This will permanently delete the user account. This action cannot be undone.';
      case 'reset-password':
        return 'This will send a password reset email to the user.';
      default:
        return '';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterRole === null ? "default" : "outline"}
              onClick={() => setFilterRole(null)}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterRole === 'free' ? "default" : "outline"}
              onClick={() => setFilterRole('free')}
              size="sm"
            >
              Free
            </Button>
            <Button
              variant={filterRole === 'premium' ? "default" : "outline"}
              onClick={() => setFilterRole('premium')}
              size="sm"
            >
              Premium
            </Button>
            <Button
              variant={filterRole === 'admin' ? "default" : "outline"}
              onClick={() => setFilterRole('admin')}
              size="sm"
            >
              Admin
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">User</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Portfolios</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found matching your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">{user.display_name || 'Unnamed User'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        {user.user_type === 'admin' ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : user.user_type === 'premium' ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Free
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        {user.portfolio_count}
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.user_type !== 'admin' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              title="Make Admin"
                              onClick={() => openActionDialog(user, 'make-admin')}
                            >
                              <ShieldCheck className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                          
                          {user.user_type === 'free' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              title="Upgrade to Premium"
                              onClick={() => openActionDialog(user, 'make-premium')}
                            >
                              <ArrowUpRight className="h-4 w-4 text-amber-500" />
                            </Button>
                          )}
                          
                          {user.user_type === 'premium' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              title="Downgrade to Free"
                              onClick={() => openActionDialog(user, 'make-free')}
                            >
                              <ArrowDownRight className="h-4 w-4 text-gray-500" />
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="Send Password Reset"
                            onClick={() => openActionDialog(user, 'reset-password')}
                          >
                            <MailPlus className="h-4 w-4 text-gray-500" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="Delete User"
                            onClick={() => openActionDialog(user, 'delete')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'delete' ? 'destructive' : 'default'} 
              onClick={confirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UserManagement;
