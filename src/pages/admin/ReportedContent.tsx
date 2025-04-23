
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { AlertTriangle, CheckCircle, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockReportedPortfolios = [
  {
    id: 'port-1',
    title: 'Developer Portfolio with Offensive Content',
    userDisplayName: 'User123',
    reportCount: 3,
    reportReasons: ['Inappropriate content', 'Offensive language'],
    reportDate: '2023-08-15T12:30:00Z',
    status: 'pending'
  },
  {
    id: 'port-2',
    title: 'Graphic Design Portfolio with Copyright Issues',
    userDisplayName: 'DesignerA',
    reportCount: 2,
    reportReasons: ['Copyright violation', 'Stolen work'],
    reportDate: '2023-08-10T09:15:00Z',
    status: 'pending'
  }
];

const mockReportedComments = [
  {
    id: 'comm-1',
    portfolioTitle: 'Web Development Portfolio',
    userDisplayName: 'Commenter456',
    content: 'This comment contains inappropriate language that violated community standards.',
    reportCount: 1,
    reportReasons: ['Harassment'],
    reportDate: '2023-08-14T14:45:00Z',
    status: 'pending'
  }
];

type ReportStatus = 'pending' | 'resolved' | 'ignored';

const ReportedContent = () => {
  const [portfolios, setPortfolios] = useState(mockReportedPortfolios);
  const [comments, setComments] = useState(mockReportedComments);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  
  const handlePortfolioAction = (id: string, action: 'resolve' | 'ignore' | 'delete') => {
    setPortfolios(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = action === 'delete' ? 'resolved' : action === 'resolve' ? 'resolved' : 'ignored';
        return { ...item, status: newStatus };
      }
      return item;
    }));
    
    const actionText = action === 'delete' ? 'deleted' : action === 'resolve' ? 'resolved' : 'ignored';
    
    toast({
      title: `Report ${actionText}`,
      description: `The reported portfolio has been ${actionText}.`
    });
  };
  
  const handleCommentAction = (id: string, action: 'resolve' | 'ignore' | 'delete') => {
    setComments(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = action === 'delete' ? 'resolved' : action === 'resolve' ? 'resolved' : 'ignored';
        return { ...item, status: newStatus };
      }
      return item;
    }));
    
    const actionText = action === 'delete' ? 'deleted' : action === 'resolve' ? 'resolved' : 'ignored';
    
    toast({
      title: `Report ${actionText}`,
      description: `The reported comment has been ${actionText}.`
    });
  };
  
  const filteredPortfolios = portfolios.filter(item => 
    statusFilter === 'all' || item.status === statusFilter
  );
  
  const filteredComments = comments.filter(item => 
    statusFilter === 'all' || item.status === statusFilter
  );
  
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      case 'ignored':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Ignored</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Reported Content</h1>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === 'all' ? 'All Reports' : 
                 statusFilter === 'pending' ? 'Pending' : 
                 statusFilter === 'resolved' ? 'Resolved' : 'Ignored'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All Reports
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('resolved')}>
                Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('ignored')}>
                Ignored
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Tabs defaultValue="portfolios" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="portfolios" className="flex items-center">
              Portfolios
              {portfolios.filter(p => p.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {portfolios.filter(p => p.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center">
              Comments
              {comments.filter(c => c.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {comments.filter(c => c.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolios">
            {filteredPortfolios.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No reported portfolios matching the current filter
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPortfolios.map(report => (
                  <Card key={report.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-medium">{report.title}</CardTitle>
                          <CardDescription>By {report.userDisplayName}</CardDescription>
                        </div>
                        {getStatusBadge(report.status as ReportStatus)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Report Details</h4>
                          <p className="text-sm mt-1">Reported {report.reportCount} times</p>
                          <p className="text-sm mt-1">Reported on {new Date(report.reportDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Reasons</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {report.reportReasons.map((reason, index) => (
                              <Badge key={index} variant="secondary">{reason}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {report.status === 'pending' && (
                        <div className="flex justify-end gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePortfolioAction(report.id, 'ignore')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Ignore
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePortfolioAction(report.id, 'resolve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            Resolve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handlePortfolioAction(report.id, 'delete')}
                          >
                            Delete Portfolio
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="comments">
            {filteredComments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No reported comments matching the current filter
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComments.map(report => (
                  <Card key={report.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-medium">Comment on "{report.portfolioTitle}"</CardTitle>
                          <CardDescription>By {report.userDisplayName}</CardDescription>
                        </div>
                        {getStatusBadge(report.status as ReportStatus)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-3 rounded-md border mb-4">
                        <p className="text-sm italic">"{report.content}"</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Report Details</h4>
                          <p className="text-sm mt-1">Reported {report.reportCount} times</p>
                          <p className="text-sm mt-1">Reported on {new Date(report.reportDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Reasons</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {report.reportReasons.map((reason, index) => (
                              <Badge key={index} variant="secondary">{reason}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {report.status === 'pending' && (
                        <div className="flex justify-end gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCommentAction(report.id, 'ignore')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Ignore
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCommentAction(report.id, 'resolve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            Resolve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCommentAction(report.id, 'delete')}
                          >
                            Delete Comment
                          </Button>
                        </div>
                      )}
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
