import { useState, useEffect ,useRef} from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import SignatureCanvas from 'react-signature-canvas';

import { Clock, FileText, Check, X, Search, AlertTriangle, Users, TrendingUp, BarChart3, PieChart } from 'lucide-react';
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
}

interface Statistics {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  deniedRequests: number;
  leaveTypeStats: { _id: string; count: number }[];
  averageDuration: number;
  monthlyTrends: { _id: string; count: number }[];
  topEmployees: { _id: string; totalDays: number }[];
  longPendingRequests: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DepartmentHeadDashboard: React.FC = () => {
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const signatureRef = useRef<SignatureCanvas>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllRequests();
    fetchDepartmentStatistics();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, allRequests]);

  const fetchAllRequests = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/department-head/all-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setAllRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch requests. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const fetchDepartmentStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/department-head/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch department statistics');
      }
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching department statistics:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch department statistics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    const filtered = allRequests.filter(request =>
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (status === 'Approved' && signatureRef.current?.isEmpty()) {
      toast({
        title: 'Signature required',
        description: 'Please provide your digital signature to approve the request.',
        variant: 'destructive',
      });
      return;
    }

    const signature = status === 'Approved' ? signatureRef.current?.toDataURL() : undefined;

    try {
      const response = await fetch(`http://localhost:8000/api/department-head/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status, 
          comment: `Request ${status} by department head`,
          signature
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${status.toLowerCase()} request`);
      }
      toast({
        title: `Request ${status}`,
        variant: 'default',
      });
      fetchAllRequests();
      fetchDepartmentStatistics();
      if (status === 'Approved') {
        signatureRef.current?.clear();
      }
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing request:`, error);
      toast({
        title: `Failed to ${status.toLowerCase()} request`,
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Department Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-4xl font-bold">{statistics.totalRequests}</p>
              <p className="text-sm">Total Requests</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">{statistics.averageDuration.toFixed(1)}</p>
              <p className="text-sm">Avg. Leave Duration (days)</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">{((statistics.approvedRequests / statistics.totalRequests) * 100).toFixed(0)}%</p>
              <p className="text-sm">Approval Rate</p>
            </div>
          </CardContent>
        </Card>

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
              <BarChart3 className="mr-2 h-5 w-5 text-green-500" /> Leave Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.leaveTypeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d">
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
              <TrendingUp className="mr-2 h-5 w-5 text-red-500" /> Monthly Trends
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
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Department Head Dashboard</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            {error === "Department head not assigned to a department" && (
              <p className="mt-2 text-red-600">Please contact the system administrator to assign you to a department.</p>
            )}
          </CardContent>
        </Card>
      ) : statistics ? (
        renderStatistics()
      ) : null}

      <div className="space-y-4">
        <div>
          <Label htmlFor="search" className="text-lg font-semibold text-gray-700">Search Leave Requests</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or reason"
              className="pl-10 pr-4 py-2 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md"
            />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Digital Signature</h3>
          <div className="border-2 border-gray-300 rounded-md overflow-hidden">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas'
              }}
            />
          </div>
          <Button onClick={() => signatureRef.current?.clear()} className="mt-2 bg-red-500 hover:bg-red-600 text-white">
            Clear Signature
          </Button>
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Leave Requests</h3>
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request._id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{request.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'Denied' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p className="flex items-center"><Clock className="mr-2 h-4 w-4" /> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
                <p className="flex items-center"><FileText className="mr-2 h-4 w-4" /> Reason: {request.reason}</p>
              </div>
              {request.status === 'Pending' && (
                <div className="mt-6 flex justify-end space-x-4">
                  <Button onClick={() => handleUpdateStatus(request._id, 'Approved')} className="bg-green-500 hover:bg-green-600 text-white">
                    <Check className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button onClick={() => handleUpdateStatus(request._id, 'Denied')} className="bg-red-500 hover:bg-red-600 text-white">
                    <X className="mr-2 h-4 w-4" /> Deny
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartmentHeadDashboard;

