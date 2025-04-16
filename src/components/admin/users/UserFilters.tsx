
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterRole: string | null;
  setFilterRole: (role: string | null) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  filterRole, 
  setFilterRole 
}) => {
  return (
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
  );
};

export default UserFilters;
