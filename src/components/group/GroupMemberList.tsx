
import React from 'react';
import { GroupMember } from '@/types/group';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface GroupMemberListProps {
  members: GroupMember[];
}

const GroupMemberList: React.FC<GroupMemberListProps> = ({ members }) => {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p>No members in this group yet.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg">
      <ul className="divide-y divide-gray-100">
        {members.map((member) => {
          const profile = member.profiles;
          const displayName = profile?.display_name || 
            (profile?.email ? profile.email.split('@')[0] : 'Anonymous User');
          const initials = displayName.substring(0, 2).toUpperCase();
          
          return (
            <li key={member.id} className="flex items-center gap-4 p-4">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-sm text-gray-500">
                  Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GroupMemberList;
