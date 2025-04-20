import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { executeSql } from '@/utils/db-helpers';
import { supabase } from '@/integrations/supabase/client';

interface ReportedContent {
  id: string;
  content_type: string;
  content_id: string;
  reporter_id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter_name?: string;
  content_title?: string;
  content_owner_id?: string;
  content_owner_name?: string;
}

const ReportedContent = () => {
  const [activeTab, setActiveTab] = useState('pending');
  
  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['admin-reports', activeTab],
    queryFn: () => executeSql<ReportedContent>(`
      SELECT r.*, 
        reporter.display_name as reporter_name,
        CASE
          WHEN r.content_type = 'portfolio' THEN (SELECT title FROM portfolios WHERE id = r.content_id::uuid)
          ELSE 'Unknown Content'
        END as content_title,
        CASE
          WHEN r.content_type = 'portfolio' THEN (SELECT user_id FROM portfolios WHERE id = r.content_id::uuid)
          ELSE NULL
        END as content_owner_id,
        CASE
          WHEN r.content_type = 'portfolio' THEN (
            SELECT p.display_name FROM portfolios port
            JOIN profiles p ON p.id = port.user_id
            WHERE port.id = r.content_id::uuid
          )
          ELSE 'Unknown User'
        END as content_owner_name
      FROM content_reports r
      LEFT JOIN profiles reporter ON reporter.id = r.reporter_id
      WHERE r.status = '${activeTab}'
      ORDER BY r.created_at DESC
    `),
    enabled: !!activeTab
  });

  const handleAction = async (reportId: string, action: string, userId?: string) => {
    try {
      // Update report status
      const { error: updateError } = await supabase.rpc('execute_sql', {
        sql_query: `
          UPDATE content_reports
          SET status = '${action === 'dismiss' ? 'dismissed' : 'resolved'}'
          WHERE id = '${reportId}'
          RETURNING id
        `
      });
      
      if (updateError) throw updateError;

      // If action is "ban", ban the user
      if (action === 'ban' && userId) {
        const { error: banError } = await supabase.rpc('execute_sql', {
          sql_query: `
            UPDATE profiles
            SET is_banned = true
            WHERE id = '${userId}'
            RETURNING id
          `
        });
        
        if (banError) throw banError;
        
        toast({
          title: "User Banned",
          description: "User has been banned from the platform"
        });
      }

      // If action is "warn", send a warning notification
      if (action === 'warn' && userId) {
        const { error: warnError } = await supabase.rpc('execute_sql', {
          sql_query: `
            INSERT INTO notifications (user_id, title, message)
            VALUES (
              '${userId}',
              'Content Warning',
              'Your content has been reported and reviewed by our moderation team. Please ensure your content follows our community guidelines.'
            )
            RETURNING id
          `
        });
        
        if (warnError) throw warnError;
        
        toast({
          title: "Warning Sent",
          description: "A warning has been sent to the user"
        });
      }

      toast({
        title: "Report Actioned",
        description: `Report has been ${action === 'dismiss' ? 'dismissed' : 'resolved'}`
      });
      
      refetch();
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} report`
      });
    }
  };

  const handleRemoveContent = async (report: ReportedContent) => {
    try {
      // Remove the reported content
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: `
          DELETE FROM ${report.content_type}s
          WHERE id = '${report.content_id}'
          RETURNING id
        `
      });
      
      if (error) throw error;
      
      // Update report status
      await supabase.rpc('execute_sql', {
        sql_query: `
          UPDATE content_reports
          SET status = 'resolved'
          WHERE id = '${report.id}'
          RETURNING id
        `
      });
      
      toast({
        title: "Content Removed",
        description: "The reported content has been removed"
      });
      
      refetch();
    } catch (error) {
      console.error('Error removing content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove content"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold tracking-tight">Reported Content</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : (reports || []).length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                No {activeTab} reports found
              </div>
            ) : (
              <div className="space-y-4">
                {(reports || []).map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {report.content_type.charAt(0).toUpperCase() + report.content_type.slice(1)}: {report.content_title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium">Reported by: {report.reporter_name || 'Anonymous'}</p>
                          <p className="text-sm text-gray-500">
                            Reported on {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="font-medium mb-2">Reason:</p>
                          <p>{report.reason}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">Content owner: {report.content_owner_name}</p>
                        </div>
                        
                        {activeTab === 'pending' && (
                          <div className="flex flex-wrap gap-2 pt-4">
                            <Button 
                              variant="outline" 
                              onClick={() => handleAction(report.id, 'dismiss')}
                            >
                              Dismiss Report
                            </Button>
                            <Button 
                              variant="secondary"
                              onClick={() => handleAction(report.id, 'warn', report.content_owner_id)}
                            >
                              Warn User
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleRemoveContent(report)}
                            >
                              Remove Content
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleAction(report.id, 'ban', report.content_owner_id)}
                            >
                              Ban User
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ReportedContent;
