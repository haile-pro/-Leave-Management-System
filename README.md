# Leave Management System

## Overview

The Leave Management System is a comprehensive web application designed to streamline and automate the leave request process within an organization. This system facilitates the entire workflow from leave application submission to approval, providing different dashboards for various stakeholders including applicants, department heads, process managers, and HR personnel.

## Key Features

- **Multi-role Access**: Specialized dashboards for Applicants, Department Heads, Process Managers, and HR personnel
- **Digital Signature Integration**: Secure approval process with digital signature capabilities
- **Comprehensive Analytics**: Advanced reporting and visualization tools for HR
- **Automated Workflow**: Streamlined process from application to approval
- **Real-time Status Tracking**: Instant updates on leave request status
- **Department-wise Reporting**: Generate customized reports filtered by department

## Technology Stack

- **Frontend**: React v18+, TypeScript, Vite for fast builds, TailwindCSS for styling
- **UI Components**: Custom components with Radix UI primitives for accessibility
- **Charts & Visualization**: Recharts for interactive data visualization
- **Backend**: Node.js with Express for RESTful API implementation
- **Database**: MongoDB for flexible document storage with Mongoose ODM
- **Authentication**: JWT-based authentication with refresh token mechanism
- **State Management**: React Context API with custom hooks
- **Testing**: Jest and React Testing Library
- **CI/CD**: GitHub Actions for automated deployment

## API Documentation

The system provides a comprehensive RESTful API for integration with other systems:

- **Authentication Endpoints**: `/api/auth/login`, `/api/auth/refresh`
- **Leave Request Endpoints**: `/api/leaves`, `/api/leaves/:id`
- **User Management**: `/api/users`, `/api/users/:id`
- **Department Endpoints**: `/api/departments`
- **Analytics Endpoints**: `/api/analytics/department`, `/api/analytics/trends`

API documentation is available through Swagger UI at `/api-docs` when running the development server.

## Dashboard Screenshots

### Landing Page
![Landing Page](./frontend/public/LandingPage.png)
*The entry point of the application providing login access and system overview*

### Applicant Dashboard
![Applicant Dashboard](./frontend/public/ApplicantDashboard.png)
*Interface for employees to submit and track their leave requests*

### Department Head Dashboard
![Department Head Dashboard](./frontend/public/DepartmentHeadDashboard.png)
*Dashboard for department heads to review and approve leave requests from their team members*

### Process Manager Dashboard
![Process Manager Dashboard](./frontend/public/ProcessManagerDashboard.png)
*Interface for process managers to finalize approved requests with digital signatures*

### HR Dashboard
![HR Dashboard](./frontend/public/HRDashboard.png)
*Comprehensive dashboard for HR personnel with analytics and reporting capabilities*

![HR Analytics](./frontend/public/HR.png)
*Detailed analytics view for HR showing leave trends and statistics*

![HR Reports](./frontend/public/HR2.png)
*Report generation interface for HR to create custom reports*

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with required environment variables
# Example:
# PORT=8000
# MONGODB_URI=mongodb://localhost:27017/leave-management
# JWT_SECRET=your_jwt_secret

# Start the server
npm start
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. **Login**: Access the system using your credentials based on your role
2. **Submit Request**: Employees can submit leave requests with start date, end date, and reason
3. **Approval Process**: Requests flow through department heads and process managers for approval
4. **Digital Signing**: Authorized personnel can digitally sign approved requests
5. **HR Management**: HR can view all requests, generate reports, and analyze leave patterns

## System Workflow

1. Employee submits leave request with required details (dates, reason, supporting documents)
2. System notifies the Department Head about the new request
3. Department Head reviews and approves/denies the request based on department policies
4. If approved, Process Manager reviews and finalizes the request with digital signature
5. HR receives notification of finalized requests
6. HR can generate reports, analyze trends, and maintain leave records
7. Employee receives notifications at each stage of the approval process

## System Architecture

The Leave Management System follows a modern microservices architecture:

- **Client Layer**: React-based SPA with responsive design
- **API Gateway**: Express.js server handling authentication and request routing
- **Service Layer**: Specialized microservices for leave management, user management, and analytics
- **Data Layer**: MongoDB database with appropriate schemas and indexes
- **Integration Layer**: Connectors for email services, calendar systems, and other enterprise applications

## Security Features

- JWT-based authentication with token expiration
- Role-based access control with granular permissions
- Secure digital signature implementation using industry-standard encryption
- Protected API endpoints with request validation
- Data encryption for sensitive information
- HTTPS protocol enforcement
- Audit logging for all system activities

## Future Enhancements

- Mobile application support with responsive design
- Calendar integration with popular platforms (Google Calendar, Outlook)
- Email and push notifications for status updates
- Advanced analytics dashboard with predictive insights
- Leave balance tracking with automatic accrual
- Integration with payroll systems
- Multi-language support
- Customizable approval workflows
- Document attachment capability for medical certificates

## Contributors

- Development Team
- UI/UX Designers
- Quality Assurance Team
- Project Stakeholders
- Technical Documentation Team

## License

This project is licensed under the MIT License - see the LICENSE file for details.