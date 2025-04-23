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

interface ReportedContent {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  status: string;
  reported_at: string;
  reported_by_name: string;
  reported_by: string;
  content_preview: string;
}

const ReportedContent = () => {
  const [selectedReport, setSelectedReport] = React.useState<ReportedContent | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      // Using raw SQL to fetch the view data
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: 'SELECT * FROM admin_reported_content ORDER BY reported_at DESC'
      });

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }
      
      // Fix the type casting issue by explicitly casting to ReportedContent[]
      return data as unknown as ReportedContent[];
    },
  });

  const handleBanUser = async (userId: string) => {
    // Implement ban user logic here
    console.log(`Banning user: ${userId}`);
    setModalOpen(false);
  };

  const handleWarnUser = async (userId: string) => {
    // Implement warn user logic here
    console.log(`Warning user: ${userId}`);
    setModalOpen(false);
  };

  const handleMarkReviewed = async (reportId: string) => {
    // Implement mark as reviewed logic here
    console.log(`Marking report as reviewed: ${reportId}`);
    setModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline">Open</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Reported Content</h1>

        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reports">User Reports</TabsTrigger>
            <TabsTrigger value="ratings">Rating Moderation</TabsTrigger>
          </TabsList>
          <TabsContent value="reports" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {reports?.map((report) => (
                  <Card key={report.id} className="bg-white shadow-md rounded-md overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">{report.reason}</CardTitle>
                      {getStatusBadge(report.status)}
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Reported by {report.reported_by_name} on {new Date(report.reported_at).toLocaleDateString()}
                      </CardDescription>
                      <p className="text-sm text-gray-500 mt-2">Content preview: {report.content_preview}</p>
                      <div className="flex justify-end mt-4">
                        <Button size="sm" onClick={() => {
                          setSelectedReport(report);
                          setModalOpen(true);
                        }}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>User Ratings</CardTitle>
                <CardDescription>Moderate user ratings and comments</CardDescription>
              </CardHeader>
              <CardContent>
                <RatingModeration />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Details Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              {selectedReport && (
                <DialogDescription>
                  Details for report on {selectedReport.content_type} by {selectedReport.reported_by_name}
                </DialogDescription>
              )}
            </DialogHeader>
            {selectedReport && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Content Type</div>
                  <div className="col-span-3">{selectedReport.content_type}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Reason</div>
                  <div className="col-span-3">{selectedReport.reason}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Reported At</div>
                  <div className="col-span-3">{new Date(selectedReport.reported_at).toLocaleDateString()}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Status</div>
                  <div className="col-span-3">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Actions</div>
                  <div className="col-span-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleBanUser(selectedReport.reported_by)}>
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleWarnUser(selectedReport.reported_by)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Warn User
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleMarkReviewed(selectedReport.id)}>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Mark as Reviewed
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ReportedContent;
