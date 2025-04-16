
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserPlus, Crown, FileText, Activity, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types for dashboard data
interface DashboardMetrics {
  total_users: number;
  premium_users: number;
  admin_users: number;
  public_portfolios: number;
}

interface RecentActivity {
  active_users_7d: number;
  recent_portfolios: {
    id: string;
    title: string;
    user_id: string;
    created_at: string;
  }[];
}

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('admin_dashboard_metrics')
          .select('*')
          .single();
        
        if (metricsError) throw metricsError;
        
        // Fetch recent portfolios (last 7 days)
        const { data: recentPortfolios, error: portfoliosError } = await supabase
          .from('portfolios')
          .select('id, title, user_id, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (portfoliosError) throw portfoliosError;
        
        // Fetch active users count for last 7 days
        const { data: activeUsersData, error: activeUsersError } = await supabase
          .rpc('get_active_users_last_7_days');
        
        if (activeUsersError) throw activeUsersError;
        
        setMetrics(metricsData);
        setRecentActivity({
          active_users_7d: activeUsersData[0]?.count || 0,
          recent_portfolios: recentPortfolios || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          variant: "destructive",
          title: "Error loading dashboard data",
          description: "There was a problem fetching the dashboard data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Data for user type pie chart
  const getUserTypeData = () => {
    if (!metrics) return [];
    
    const regularUsers = metrics.total_users - metrics.premium_users - metrics.admin_users;
    
    return [
      { name: 'Regular Users', value: regularUsers, color: '#94a3b8' },
      { name: 'Premium Users', value: metrics.premium_users, color: '#f59e0b' },
      { name: 'Admin Users', value: metrics.admin_users, color: '#3b82f6' }
    ];
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.total_users || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                  <Crown className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.premium_users || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.total_users 
                      ? `${((metrics.premium_users / metrics.total_users) * 100).toFixed(1)}% of users`
                      : '0% of users'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Public Portfolios</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.public_portfolios || 0}</div>
                  <p className="text-xs text-muted-foreground">Shared to community</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Users (7d)</CardTitle>
                  <Activity className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentActivity?.active_users_7d || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.total_users 
                      ? `${((recentActivity?.active_users_7d || 0) / metrics.total_users * 100).toFixed(1)}% of total users`
                      : '0% of total users'}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts & Data Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* User Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Breakdown of user types on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getUserTypeData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getUserTypeData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Portfolios */}
              <Card>
                <CardHeader>
                  <CardTitle>Recently Created Portfolios</CardTitle>
                  <CardDescription>Latest portfolios added to the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity?.recent_portfolios && recentActivity.recent_portfolios.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.recent_portfolios.map((portfolio) => (
                        <div key={portfolio.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <h4 className="font-medium">{portfolio.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(portfolio.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(`/portfolio/view/${portfolio.id}`)}
                            className="text-sm text-blue-500 hover:underline"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent portfolios found
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/admin/users')}>
                  <CardContent className="flex items-center p-6">
                    <Users className="h-6 w-6 mr-4 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Manage Users</h3>
                      <p className="text-sm text-muted-foreground">Review and manage user accounts</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/admin/portfolios')}>
                  <CardContent className="flex items-center p-6">
                    <FileText className="h-6 w-6 mr-4 text-emerald-500" />
                    <div>
                      <h3 className="font-medium">Manage Portfolios</h3>
                      <p className="text-sm text-muted-foreground">Review and manage shared portfolios</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/admin/reports')}>
                  <CardContent className="flex items-center p-6">
                    <AlertTriangle className="h-6 w-6 mr-4 text-amber-500" />
                    <div>
                      <h3 className="font-medium">Review Reports</h3>
                      <p className="text-sm text-muted-foreground">Handle reported content</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
