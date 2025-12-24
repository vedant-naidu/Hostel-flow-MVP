import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { StudentNav } from '@/components/layout/StudentNav';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceCheckIn } from '@/components/student/AttendanceCheckIn';
import { MaintenanceForm, MaintenanceList } from '@/components/student/MaintenanceTicket';
import { GatePassForm, GatePassList } from '@/components/student/GatePassRequest';
import { HostelDirectory } from '@/components/student/HostelDirectory';
import { StatCard } from '@/components/ui/stat-card';
import { MapPin, Ticket, Wrench, Users } from 'lucide-react';
import { getTodayAttendance, getUserGatePasses, getTickets } from '@/lib/storage';

const StudentDashboard = () => {
  const { user } = useAuth();
  const todayAttendance = getTodayAttendance();
  const userCheckedIn = todayAttendance.some(r => r.userId === user?.id);
  const pendingPasses = getUserGatePasses(user?.id || '').filter(p => p.status === 'pending').length;
  const activeTickets = getTickets().filter(t => t.userId === user?.id && t.status !== 'resolved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Room {user?.roomNumber} • {user?.hostelBlock}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Status"
          value={userCheckedIn ? 'Present' : 'Not Checked In'}
          icon={<MapPin className="w-5 h-5" />}
          variant={userCheckedIn ? 'success' : 'warning'}
        />
        <StatCard
          title="Pending Passes"
          value={pendingPasses}
          icon={<Ticket className="w-5 h-5" />}
          variant={pendingPasses > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Active Tickets"
          value={activeTickets}
          icon={<Wrench className="w-5 h-5" />}
          variant={activeTickets > 0 ? 'primary' : 'default'}
        />
        <StatCard
          title="Hostelmates"
          value="8"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AttendanceCheckIn />
        <GatePassForm />
      </div>
    </div>
  );
};

const AttendancePage = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold">Attendance</h1>
      <p className="text-muted-foreground">Mark your daily check-in</p>
    </div>
    <AttendanceCheckIn />
  </div>
);

const MaintenancePage = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold">Maintenance</h1>
      <p className="text-muted-foreground">Report and track issues</p>
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <MaintenanceForm />
      <div className="space-y-4">
        <h2 className="font-semibold">Your Tickets</h2>
        <MaintenanceList />
      </div>
    </div>
  </div>
);

const GatePassPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold">Gate Pass</h1>
      <p className="text-muted-foreground">Request leave permission</p>
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <GatePassForm />
      <div className="space-y-4">
        <h2 className="font-semibold">Your Requests</h2>
        <GatePassList />
      </div>
    </div>
  </div>
);

const DirectoryPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold">Directory</h1>
      <p className="text-muted-foreground">Connect with hostelmates</p>
    </div>
    <HostelDirectory />
  </div>
);

export const StudentDashboardPage = () => {
  return (
    <AppLayout navigation={<StudentNav />}>
      <Routes>
        <Route index element={<StudentDashboard />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="gate-pass" element={<GatePassPage />} />
        <Route path="directory" element={<DirectoryPage />} />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </AppLayout>
  );
};
