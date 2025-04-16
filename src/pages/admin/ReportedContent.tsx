
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// This is placeholder data since we haven't implemented a reporting system yet
const placeholderReports = [
  {
    id: '1',
    content_type: 'portfolio',
    content_id: '98765-placeholder-id',
    content_title: 'Marketing Portfolio with Inappropriate Content',
    reporter_id: 'user-123',
    reporter_name: 'John Smith',
    reason: 'Inappropriate content',
    description: 'This portfolio contains explicit language that violates community standards.',
    status: 'pending',
    created_at: '2025-04-10T14:30:00Z',
    report_count: 3
  },
  {
    id: '2',
    content_type: 'comment',
    content_id: '54321-placeholder-id',
    content_title: 'Comment on Developer Portfolio',
    reporter_id: 'user-456',
    reporter_name: 'Alice Johnson',
    reason: 'Spam',
    description: 'This comment is promotional spam and not related to the portfolio.',
    status: 'pending',
    created_at: '2025-04-12T09:15:00Z',
    report_count: 1
  },
  {
    id: '3',
    content_type: 'portfolio',
    content_id: '13579-placeholder-id',
    content_title: 'Photography Portfolio with Misleading Content',
    reporter_id: 'user-789',
    reporter_name: 'Michael Brown',
    reason: 'Misleading information',
    description: 'The portfolio claims to include original photos, but they appear to be stock images.',
    status: 'pending',
    created_at: '2025-04-13T17:45:00Z',
    report_count: 2
  }
];

type Report = typeof placeholderReports[0];

const ReportedContent = () => {
  const [reports, setReports] = useState<Report[]>(placeholderReports);
  const [actionReport, setActionReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleResolveReport = (reportId: string) => {
    // Update local state to mark as resolved
    setReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'resolved' } 
          : report
      )
    );
    
    toast({
      title: "Report resolved",
      description: "The report has been marked as resolved."
    });
  };

  const handleDeleteContent = (reportId: string) => {
    // In a real app, this would delete the reported content
    // For now, we'll just mark the report as resolved and update the UI
    setReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'content_removed' } 
          : report
      )
    );
    
    toast({
      title: "Content removed",
      description: "The reported content has been removed."
    });
  };

  const openActionDialog = (report: Report, action: string) => {
    setActionReport(report);
    setActionType(action);
    setShowDialog(true);
  };

  const confirmAction = () => {
    if (!actionReport || !actionType) return;
    
    switch (actionType) {
      case 'resolve':
        handleResolveReport(actionReport.id);
        break;
      case 'delete':
        handleDeleteContent(actionReport.id);
        break;
      default:
        break;
    }
    
    setShowDialog(false);
    setActionReport(null);
    setActionType(null);
  };

  const getActionTitle = () => {
    if (!actionType || !actionReport) return '';
    
    switch (actionType) {
      case 'resolve':
        return 'Resolve report without action?';
      case 'delete':
        return `Remove reported ${actionReport.content_type}?`;
      default:
        return '';
    }
  };

  const getActionDescription = () => {
    if (!actionType || !actionReport) return '';
    
    switch (actionType) {
      case 'resolve':
        return 'This will mark the report as resolved without taking any action on the content.';
      case 'delete':
        return `This will remove the reported ${actionReport.content_type} and mark the report as resolved.`;
      default:
        return '';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Reported Content</h1>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-500 h-5 w-5 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-700">Demo Feature</h3>
              <p className="text-sm text-yellow-600">
                This page displays placeholder data to demonstrate how the content reporting system would work. 
                The reporting functionality has not been fully implemented yet.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Reported Content</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Reason</TableHead>
                <TableHead className="hidden lg:table-cell">Reporter</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No reported content found
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.content_title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {report.description}
                        </div>
                        {report.report_count > 1 && (
                          <Badge variant="destructive" className="mt-1">
                            {report.report_count} reports
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="capitalize">
                        {report.content_type}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">
                      {report.reason}
                    </TableCell>
                    
                    <TableCell className="hidden lg:table-cell">
                      {report.reporter_name}
                    </TableCell>
                    
                    <TableCell className="hidden lg:table-cell">
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      {report.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="View Content"
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="Resolve Without Action"
                            onClick={() => openActionDialog(report, 'resolve')}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="Remove Content"
                            onClick={() => openActionDialog(report, 'delete')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <Badge 
                          variant={report.status === 'resolved' ? "outline" : "destructive"} 
                          className="capitalize"
                        >
                          {report.status === 'resolved' ? 'Resolved' : 'Content Removed'}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'delete' ? 'destructive' : 'default'} 
              onClick={confirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ReportedContent;
