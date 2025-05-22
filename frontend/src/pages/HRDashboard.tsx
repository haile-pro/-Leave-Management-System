import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Download, AlertTriangle, Users, FileText, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeaveRequest {
  _id: string;
  name: string;
  department: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  departmentHeadSignature?: {
    imagePath: string;
    timestamp: string;
  };
  processManagerSignature?: {
    imagePath: string;
    timestamp: string;
  };
}

interface Statistics {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  deniedRequests: number;
  departmentStats: { _id: string; count: number }[];
  leaveTypeStats: { _id: string; count: number }[];
  averageDuration: number;
  monthlyTrends: { _id: string; count: number }[];
  longPendingRequests: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const HRDashboard: React.FC = () => {
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [department, setDepartment] = useState('');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllRequests();
    fetchStatistics();
  }, []);

  const fetchAllRequests = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/hr/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllRequests(data);
      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching all requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch requests. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/hr/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        throw new Error('Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch statistics. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/hr/report${department ? `?department=${department}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'leave_requests_report.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast({
          title: 'Report generated successfully',
          description: 'The report has been downloaded.',
          variant: 'default',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Failed to generate report',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">HR Dashboard</h2>
      
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-4xl font-bold">{statistics?.totalRequests || 0}</p>
            <p className="text-sm">Total Requests</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">{statistics?.averageDuration.toFixed(1) || 0}</p>
            <p className="text-sm">Avg. Leave Duration (days)</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">{statistics?.longPendingRequests || 0}</p>
            <p className="text-sm">Long Pending Requests</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-end space-x-4 mb-6">
        <div className="flex-grow">
          <Label htmlFor="department" className="text-gray-700">Department (optional)</Label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Enter department name"
            className="mt-1"
          />
        </div>
        <Button onClick={handleGenerateReport} className="bg-green-500 hover:bg-green-600 text-white">
          <Download className="mr-2 h-4 w-4" /> Generate Report
        </Button>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
                <PieChart className="mr-2 h-5 w-5 text-blue-500" /> Leave Request Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={[
                      { name: 'Approved', value: statistics.approvedRequests },
                      { name: 'Pending', value: statistics.pendingRequests },
                      { name: 'Denied', value: statistics.deniedRequests },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
                <Users className="mr-2 h-5 w-5 text-green-500" /> Requests by Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d">
                    {statistics.departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
                <FileText className="mr-2 h-5 w-5 text-yellow-500" /> Leave Type Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.leaveTypeStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="_id" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {statistics.leaveTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
                <TrendingUp className="mr-2 h-5 w-5 text-red-500" /> Monthly Leave Request Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statistics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {statistics.longPendingRequests > 0 && (
            <Card className="col-span-full bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-yellow-700">
                  <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" /> Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700">
                  {statistics.longPendingRequests} requests are pending for more than 7 days. Please review and take action.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">All Leave Requests</h3>
      <div className="space-y-4">
        {allRequests.map((request) => (
          <Card key={request._id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{request.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'Denied' ? 'bg-red-100 text-red-800' :
                  request.status === 'Finalized' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p className="flex items-center"><Clock className="mr-2 h-4 w-4" /> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
                <p className="flex items-center"><Users className="mr-2 h-4 w-4" /> Department: {request.department}</p>
                <p className="flex items-center"><FileText className="mr-2 h-4 w-4" /> Reason: {request.reason}</p>
              </div>
              {(request.departmentHeadSignature || request.processManagerSignature) && (
                <div className="mt-4 space-y-2">
                  {request.departmentHeadSignature && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Department Head Signature:</p>
                      <img
                        src={`http://localhost:8000${request.departmentHeadSignature.imagePath}`}
                        alt="Department Head Signature"
                        className="max-w-[200px] max-h-[100px] border border-gray-200 rounded"
                      />
                      <p className="text-xs text-gray-500">
                        Signed on: {new Date(request.departmentHeadSignature.timestamp).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {request.processManagerSignature && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Process Manager Signature:</p>
                      <img
                        src={`http://localhost:8000${request.processManagerSignature.imagePath}`}
                        alt="Process Manager Signature"
                        className="max-w-[200px] max-h-[100px] border border-gray-200 rounded"
                      />
                      <p className="text-xs text-gray-500">
                        Signed on: {new Date(request.processManagerSignature.timestamp).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HRDashboard;

