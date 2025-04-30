
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Group, GroupMember, GroupPortfolio } from '@/types/group';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GroupPortfolioList from '@/components/group/GroupPortfolioList';
import GroupMemberList from '@/components/group/GroupMemberList';
import GroupDiscussion from '@/components/group/GroupDiscussion';
import SharePortfolioModal from '@/components/group/SharePortfolioModal';
import { safeParsePortfolioContent } from '@/types/portfolio';

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [portfolios, setPortfolios] = useState<GroupPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);
  
  const fetchGroupDetails = async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      
      // Get group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();
      
      if (groupError) throw groupError;
      
      setGroup(groupData);
      
      if (user) {
        // Check if user is a member
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupId)
          .eq('user_id', user.id);
        
        if (!memberError && memberData && memberData.length > 0) {
          setIsMember(true);
        }
        
        // Get all members
        const { data: allMembers, error: membersError } = await supabase
          .from('group_members')
          .select(`
            *,
            profiles:user_id (
              id,
              display_name,
              email
            )
          `)
          .eq('group_id', groupId);
        
        if (!membersError && allMembers) {
          // Transform the data to match our TypeScript interface
          const typedMembers: GroupMember[] = allMembers.map(member => {
            // Check if profiles is an error and handle it
            if (member.profiles && typeof member.profiles === 'object' && 'error' in member.profiles) {
              return {
                ...member,
                profiles: null
              };
            }
            return {
              ...member,
              profiles: member.profiles || null
            };
          });
          
          setMembers(typedMembers);
        }
        
        // Get shared portfolios if user is a member
        if (memberData && memberData.length > 0) {
          const { data: portfolioData, error: portfolioError } = await supabase
            .from('group_portfolios')
            .select(`
              *,
              portfolios:portfolio_id (*),
              profiles:shared_by (
                id,
                display_name,
                email
              )
            `)
            .eq('group_id', groupId);
          
          if (!portfolioError && portfolioData) {
            // Transform the data to match our TypeScript interface
            const typedPortfolios: GroupPortfolio[] = portfolioData.map(item => {
              // Handle profile errors
              let profileData = item.profiles;
              if (item.profiles && typeof item.profiles === 'object' && 'error' in item.profiles) {
                profileData = null;
              }
              
              return {
                ...item,
                portfolios: {
                  ...item.portfolios,
                  content: safeParsePortfolioContent(item.portfolios.content)
                },
                profiles: profileData
              };
            });
            
            setPortfolios(typedPortfolios);
          }
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching group details',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinGroup = async () => {
    if (!user || !groupId) return;
    
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id
        });
      
      if (error) throw error;
      
      toast({
        title: 'Joined group successfully',
        description: `You've joined ${group?.name}`,
      });
      
      setIsMember(true);
      fetchGroupDetails(); // Refresh data
    } catch (error: any) {
      toast({
        title: 'Error joining group',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleLeaveGroup = async () => {
    if (!user || !groupId) return;
    
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Left group successfully',
        description: `You've left ${group?.name}`,
      });
      
      setIsMember(false);
      setPortfolios([]); // Clear portfolios as user can't see them anymore
    } catch (error: any) {
      toast({
        title: 'Error leaving group',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </>
    );
  }
  
  if (!group) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Group not found</h2>
            <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <button 
              onClick={() => navigate('/groups')}
              className="inline-flex items-center text-sm text-gray-600 mb-2"
            >
              &larr; Back to Groups
            </button>
            <h1 className="text-3xl font-bold">{group.name}</h1>
          </div>
          
          {user && (
            isMember ? (
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsShareModalOpen(true)} 
                  className="bg-gray-700 hover:bg-gray-800"
                >
                  Share Portfolio
                </Button>
                <Button variant="outline" onClick={handleLeaveGroup}>Leave Group</Button>
              </div>
            ) : (
              <Button onClick={handleJoinGroup}>Join Group</Button>
            )
          )}
        </div>
        
        {group.cover_image && (
          <div className="relative mb-6 h-40 md:h-60 overflow-hidden rounded-lg">
            <img 
              src={group.cover_image} 
              alt={`${group.name} cover`} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        )}
        
        {group.description && (
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <h3 className="font-medium mb-2">About this group</h3>
            <p>{group.description}</p>
          </div>
        )}
        
        {user && isMember ? (
          <Tabs defaultValue="portfolios" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolios">
              <GroupPortfolioList 
                portfolios={portfolios} 
                onRefresh={fetchGroupDetails} 
                isCurrentUserOwner={user?.id === group.created_by}
              />
            </TabsContent>
            
            <TabsContent value="members">
              <GroupMemberList members={members} />
            </TabsContent>
            
            <TabsContent value="discussion">
              <GroupDiscussion groupId={groupId || ''} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium mb-2">Join this group to see shared portfolios and participate in discussions</h2>
            {user ? (
              <Button onClick={handleJoinGroup} className="mt-4">Join Group</Button>
            ) : (
              <Button onClick={() => navigate('/auth')} className="mt-4">Sign in to Join</Button>
            )}
          </div>
        )}
      </div>
      
      {isShareModalOpen && (
        <SharePortfolioModal 
          groupId={groupId || ''}
          open={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShareSuccess={fetchGroupDetails}
        />
      )}
    </>
  );
};

export default GroupDetail;
