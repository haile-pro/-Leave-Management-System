import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock } from 'lucide-react';

interface LeaveRequest {
  _id: string;
  name: string;
  department: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

const ApplicantDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/applicants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Received leave requests:', data);
        setLeaveRequests(data);
      } else {
        throw new Error('Failed to fetch leave requests');
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leave requests. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/applicants/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, department, startDate, endDate, reason }),
      });
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Leave request submitted successfully',
          variant: 'default',
        });
        fetchLeaveRequests(); // Fetch updated list after submission
        setName('');
        setDepartment('');
        setStartDate('');
        setEndDate('');
        setReason('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Submit Leave Request</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label  htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-8"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-8"
                required
              />
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Submit Leave Request</Button>
      </form>

      <h2 className="text-2xl font-bold mt-8">Your Leave Requests</h2>
      <div className="space-y-4">
        {leaveRequests.length === 0 ? (
          <p>No leave requests found.</p>
        ) : (
          leaveRequests.map((request) => (
            <div key={request._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{request.reason}</h3>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'Denied' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p><Clock className="inline-block mr-1 h-4 w-4" /> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
                <p>Department: {request.department}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;
