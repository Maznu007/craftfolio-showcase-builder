
import React from 'react';
import { UserData } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserStatsCardProps {
  users: UserData[];
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ users }) => {
  // Calculate user counts by role
  const freeUsers = users.filter(u => u.user_type === 'free').length;
  const premiumUsers = users.filter(u => u.user_type === 'premium').length;
  const adminUsers = users.filter(u => u.user_type === 'admin').length;
  const totalUsers = users.length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">User Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{totalUsers}</span>
            <span className="text-sm text-muted-foreground">Total Users</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{freeUsers}</span>
            <span className="text-sm text-muted-foreground">Free Users</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{premiumUsers}</span>
            <span className="text-sm text-muted-foreground">Premium Users</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{adminUsers}</span>
            <span className="text-sm text-muted-foreground">Admin Users</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
