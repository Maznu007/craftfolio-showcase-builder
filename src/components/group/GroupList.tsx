
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Group } from '@/types/group';
import { formatDistanceToNow } from 'date-fns';
import { Users } from 'lucide-react';

interface GroupListProps {
  groups: Group[];
  loading: boolean;
}

const GroupList: React.FC<GroupListProps> = ({ groups, loading }) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden h-48 animate-pulse">
            <div className="h-24 bg-gray-200"></div>
            <CardContent className="p-4">
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (groups.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-1">No groups yet</h3>
        <p className="text-gray-500">Be the first to create a group or check back later.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <Card 
          key={group.id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/groups/${group.id}`)}
        >
          {group.cover_image ? (
            <div className="h-32 overflow-hidden relative">
              <img 
                src={group.cover_image} 
                alt={group.name} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
          )}
          
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-1 line-clamp-1">{group.name}</h3>
            {group.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">{group.description}</p>
            )}
          </CardContent>
          
          <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Created {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}
            </span>
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" /> Group
            </Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default GroupList;
