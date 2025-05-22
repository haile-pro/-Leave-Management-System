import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, CheckSquare } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas'



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
}

const ProcessManagerDashboard: React.FC = () => {
  const [approvedRequests, setApprovedRequests] = useState<LeaveRequest[]>([]);
  const signatureRef = useRef<SignatureCanvas>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const fetchApprovedRequests = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/process-manager/approved', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setApprovedRequests(data);
      }
    } catch (error) {
      console.error('Error fetching approved requests:', error);
    }
  };

  const handleFinalizeRequest = async (id: string) => {
    if (signatureRef.current?.isEmpty()) {
      toast({
        title: 'Signature required',
        description: 'Please provide your digital signature to finalize the request.',
        variant: 'destructive',
      });
      return;
    }

    const signature = signatureRef.current?.toDataURL();

    try {
      const response = await fetch(`http://localhost:8000/api/process-manager/finalize/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ signature }),
      });
      if (response.ok) {
        toast({
          title: 'Request finalized successfully',
          variant: 'default',
        });
        fetchApprovedRequests();
        signatureRef.current?.clear();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Failed to finalize request',
          description: errorData.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error finalizing request:', error);
      toast({
        title: 'Failed to finalize request',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Process Manager Dashboard</h2>
      <div>
        <h3 className="text-lg font-semibold mb-2">Digital Signature</h3>
        <div className="border border-gray-300 rounded-md">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              width: 500,
              height: 200,
              className: 'signature-canvas'
            }}
          />
        </div>
        <Button onClick={() => signatureRef.current?.clear()} className="mt-2">
          Clear Signature
        </Button>
      </div>
      <h3 className="text-xl font-semibold">Approved Leave Requests</h3>
      <div className="space-y-4">
        {approvedRequests.map((request) => (
          <div key={request._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{request.name}</h3>
              <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Approved
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p><Clock className="inline-block mr-1 h-4 w-4" /> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
              <p className="mt-1">{request.reason}</p>
              {request.departmentHeadSignature && (
                <div className="mt-2">
                  <p>Department Head Signature:</p>
                  <img
                    src={`http://localhost:8000${request.departmentHeadSignature.imagePath}`}
                    alt="Department Head Signature"
                    className="max-w-[200px] max-h-[100px]"
                  />
                  <p className="text-xs text-gray-500">
                    Signed on: {new Date(request.departmentHeadSignature.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => handleFinalizeRequest(request._id)} size="sm" variant="outline">
                <CheckSquare className="mr-1 h-4 w-4" /> Finalize
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessManagerDashboard;

