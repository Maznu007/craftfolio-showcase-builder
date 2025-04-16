
import React from 'react';
import { UserData } from '@/types/admin';

interface UserStatsCardProps {
  users: UserData[];
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ users }) => {
  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-md">
      <p className="text-sm text-gray-500">Total users: {users.length}</p>
      <p className="text-sm text-gray-500">Free users: {users.filter(u => u.user_type === 'free').length}</p>
      <p className="text-sm text-gray-500">Premium users: {users.filter(u => u.user_type === 'premium').length}</p>
      <p className="text-sm text-gray-500">Admin users: {users.filter(u => u.user_type === 'admin').length}</p>
    </div>
  );
};

export default UserStatsCard;
