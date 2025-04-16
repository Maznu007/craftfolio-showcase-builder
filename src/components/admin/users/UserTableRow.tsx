
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, ShieldCheck, ArrowUpRight, ArrowDownRight, MailPlus, Trash2, Crown } from 'lucide-react';
import { UserData } from '@/types/admin';

interface UserTableRowProps {
  user: UserData;
  openActionDialog: (user: UserData, action: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, openActionDialog }) => {
  return (
    <TableRow>
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
  );
};

export default UserTableRow;
