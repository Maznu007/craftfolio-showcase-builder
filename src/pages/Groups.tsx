
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import GroupList from '@/components/group/GroupList';
import { Group } from '@/types/group';

const Groups = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchGroups();
  }, []);
  
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      setGroups(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching groups',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Groups</h1>
          {userType === 'admin' && (
            <button
              onClick={() => navigate('/groups/create')}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
            >
              Create Group
            </button>
          )}
        </div>
        
        <GroupList groups={groups} loading={loading} />
      </div>
    </>
  );
};

export default Groups;
