import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { FileText, LogOut } from 'lucide-react';
import ApplicantDashboard from './ApplicantDashboard';
import DepartmentHeadDashboard from './DepartmentHeadDashboard';
import ProcessManagerDashboard from './ProcessManagerDashboard';
import HRDashboard from './HRDashboard';

interface UserData {
  role: string;
}

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserData({ role: payload.role.toLowerCase() });
      } catch (error) {
        console.error('Error parsing token:', error);
        handleLogout();
      }
    } else {
      handleLogout();
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderDashboard = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    switch (userData?.role) {
      case 'applicant':
        return <ApplicantDashboard />;
      case 'departmenthead':
        return <DepartmentHeadDashboard />;
      case 'processmanager':
        return <ProcessManagerDashboard />;
      case 'hr':
        return <HRDashboard />;
      default:
        return <div>Invalid user role: {userData?.role}</div>;
    }
  };

  const capitalizeRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <FileText className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">LMS</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm font-medium text-gray-500">
                {userData?.role && `Logged in as ${capitalizeRole(userData.role)}`}
              </span>
              <Button onClick={handleLogout} variant="ghost">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;

