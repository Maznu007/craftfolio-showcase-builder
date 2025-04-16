
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { UserData } from '@/types/admin';

interface ConfirmationDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  actionUser: UserData | null;
  actionType: string | null;
  isDeleting: boolean;
  confirmAction: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  showDialog,
  setShowDialog,
  actionUser,
  actionType,
  isDeleting,
  confirmAction
}) => {
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
            disabled={isDeleting && actionType === 'delete'}
          >
            {isDeleting && actionType === 'delete' ? 'Deleting...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
