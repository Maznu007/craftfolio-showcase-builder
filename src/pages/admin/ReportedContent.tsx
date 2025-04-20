
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ban, Flag, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import RatingModeration from '@/components/admin/RatingModeration';

const ReportedContent = () => {
  const [selectedReport, setSelectedReport] = React.useState<any>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_reported_content')
        .select('*')
        .order('reported_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleBanUser = async (userId: string) => {
    const { error } = await supabase.rpc('ban_user', { user_id_to_ban: userId });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to ban user",
      });
      return;
    }

    toast({
      title: "Success",
      description: "User has been banned",
    });
    refetch();
  };

  const handleWarnUser = async (userId: string) => {
    const warning = "Your content has been flagged for review. This is a warning.";
    const { error } = await supabase.rpc('warn_user', { 
      user_id_to_warn: userId,
      warning: warning
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to warn user",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Warning has been sent to user",
    });
    refetch();
  };

  const handleMarkReviewed = async (reportId: string) => {
    const { error } = await supabase
      .from('content_reports')
      .update({ status: 'reviewed' })
      .eq('id', reportId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update report status",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Report has been marked as reviewed",
    });
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Reviewed</Badge>;
      case 'ignored':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Ignored</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Content Moderation</h1>
        </div>
        
        <Tabs defaultValue="reports" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">Reported Content</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : reports?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No reported content to review
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report: any) => (
                  <Card key={report.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {report.content_type.toUpperCase()} Report
                          </CardTitle>
                          <CardDescription>
                            Reported by {report.reported_by_name}
                          </CardDescription>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Reason</h4>
                          <p className="text-sm">{report.reason}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Content Preview</h4>
                          <p className="text-sm line-clamp-3">{report.content_preview}</p>
                          {report.content_preview && (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setModalOpen(true);
                              }}
                            >
                              View Full Content
                            </Button>
                          )}
                        </div>
                        
                        {report.status === 'pending' && (
                          <div className="flex gap-2 justify-end mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWarnUser(report.reported_by)}
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              Warn User
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBanUser(report.reported_by)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban User
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMarkReviewed(report.id)}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Mark Reviewed
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
          
          <TabsContent value="ratings">
            <RatingModeration />
          </TabsContent>
        </Tabs>
        
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reported Content</DialogTitle>
              <DialogDescription>
                Type: {selectedReport?.content_type}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="prose max-w-none">
                <p>{selectedReport?.content_preview}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ReportedContent;
