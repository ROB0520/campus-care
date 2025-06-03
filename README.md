# Campus Care

A comprehensive healthcare management system for educational institutions, built with Next.js and TypeScript.

> **Note**: This project was developed as a case study for CC-105 (subject coursework) to demonstrate the implementation of a full-stack healthcare management system using modern web technologies.

## 🏥 Overview

Campus Care is a web-based healthcare management platform designed specifically for schools and universities. It streamlines the process of managing student health records, appointments, and medical consultations while providing different interfaces for students, clinic staff, and administrators.

## ✨ Features

### For Students
- **Health Survey & Medical History**: Complete comprehensive health assessments
- **Personal Information Management**: Maintain up-to-date personal and emergency contact information
- **Appointment Booking**: Schedule medical appointments with clinic staff
- **Real-time Notifications**: Receive instant updates about appointment status via Socket.io
- **Profile Verification**: Ensure all required information is completed before accessing services

### For Clinic Staff
- **Patient Management**: Access student health records and medical history
- **Consultation History**: Record and track medical consultations
- **Appointment Management**: Approve, reschedule, or cancel student appointments
- **Profile Management**: Maintain clinic staff information and credentials

### For Administrators
- **User Management**: Manage student and clinic staff accounts
- **System Overview**: Monitor platform usage and health statistics
- **Account Creation**: Create and manage user accounts across the system

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: MySQL with mysql2
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand with persistence
- **Real-time Communication**: Socket.io
- **Email**: Nodemailer with React Email templates
- **Date Handling**: Moment.js with timezone support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ROB0520/campus-care.git
   cd campus-care
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=campus_care
   DB_PORT=3306

   # NextAuth Configuration
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # Email Configuration
   EMAIL_USER=your_email@domain.com
   EMAIL_PASS=your_email_password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587

   # Socket.io Configuration
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3519
   ```

4. **Set up the database**
   
   Run the SQL schema to create the required tables:
   ```bash
   mysql -u your_username -p your_database < db.sql
   ```

5. **Populate sample data (optional)**
   
   Run the setup script to create sample users and data:
   ```bash
   npm run setup
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Start the Socket.io server**
   ```bash
   npm run socket
   ```

   The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard pages
│   ├── clinic/                   # Clinic staff pages
│   ├── student/                  # Student portal pages
│   └── api/                      # API routes
├── components/                   # Reusable React components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utility functions and configurations
│   ├── schema/                   # Zod validation schemas
│   └── store/                    # Zustand store configurations
├── mail/                         # Email templates
└── public/                       # Static assets
```

## 🔐 Authentication & Authorization

The system implements role-based access control with three user types:

- **Students (role: 0)**: Access to personal health management features
- **Clinic Staff (role: 1)**: Access to patient management and consultation features  
- **Administrators (role: 2)**: Access to system management and user administration

## 📧 Email Notifications

Automated email notifications are sent for:
- Appointment confirmations
- Appointment reminders  
- Appointment cancellations
- Appointment rescheduling
- Password reset requests
- Emergency notifications

## 🔄 Real-time Features

Socket.io integration provides real-time notifications for:
- Appointment status updates
- New appointment bookings
- System announcements

## 🗄 Database Schema

Key database tables include:
- `Users`: User authentication and role management
- `PersonalInformation`: Student personal and emergency contact data
- `HealthSurvey`: Comprehensive health assessments and medical history
- `Appointments`: Appointment scheduling and status tracking
- `ConsultationHistory`: Medical consultation records
- `ClinicProfile`: Clinic staff information
- `AppointmentNotifications`: Real-time notification management

## 🚀 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Environment Configuration

Ensure all environment variables are properly configured for your production environment, including:
- Database connection strings
- Email service credentials
- Authentication secrets
- Socket.io server configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.