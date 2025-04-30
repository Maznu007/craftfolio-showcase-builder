
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const groupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  cover_image: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
});

type GroupFormValues = z.infer<typeof groupSchema>;

const GroupCreate = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      cover_image: ''
    }
  });
  
  // Redirect non-admin users
  React.useEffect(() => {
    if (userType !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can create groups.',
        variant: 'destructive',
      });
      navigate('/groups');
    }
  }, [userType, navigate, toast]);
  
  const onSubmit = async (data: GroupFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: groupData, error } = await supabase
        .from('groups')
        .insert({
          name: data.name,
          description: data.description || null,
          cover_image: data.cover_image || null,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Auto-join the creator to the group
      await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id
        });
      
      toast({
        title: 'Group created successfully',
        description: `"${data.name}" has been created.`,
      });
      
      navigate(`/groups/${groupData.id}`);
    } catch (error: any) {
      toast({
        title: 'Error creating group',
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button 
          onClick={() => navigate('/groups')}
          className="inline-flex items-center text-sm text-gray-600 mb-4"
        >
          &larr; Back to Groups
        </button>
        
        <h1 className="text-3xl font-bold mb-6">Create New Group</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this group is about" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cover_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => navigate('/groups')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default GroupCreate;
