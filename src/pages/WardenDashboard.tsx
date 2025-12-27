import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { WardenNav } from '@/components/layout/WardenNav';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, Ticket, Wrench, AlertTriangle, Clock, CheckCircle2, XCircle,
  Search, BarChart3, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useAttendanceRecords, 
  useGatePasses, 
  useMaintenanceTickets, 
  useHostelmates 
} from '@/hooks/useDatabase';
import { supabase } from '@/integrations/supabase/client';

const WardenDashboard = () => {
  const { user } = useAuth();
  const { records: todayAttendance, isLoading: attendanceLoading } = useAttendanceRecords();
  const { hostelmates, isLoading: hostelmatesLoading } = useHostelmates();
  const { passes: gatePasses, isLoading: passesLoading } = useGatePasses();
  const { tickets, isLoading: ticketsLoading } = useMaintenanceTickets();

  const isLoading = attendanceLoading || hostelmatesLoading || passesLoading || ticketsLoading;

  const totalStudents = hostelmates?.length || 0;
  const presentToday = new Set(
    todayAttendance?.filter(r => r.type === 'check-in').map(r => r.user_id)
  ).size;
  const attendancePercent = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
  
  const pendingPasses = gatePasses?.filter(p => p.status === 'pending').length || 0;
  const activeTickets = tickets?.filter(t => t.status !== 'resolved').length || 0;
  const lateComers = totalStudents - presentToday;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Warden Dashboard</h1>
        <p className="text-muted-foreground">Real-time hostel overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Today"
          value={`${attendancePercent}%`}
          description={`${presentToday}/${totalStudents} students`}
          icon={<Users className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title="Pending Passes"
          value={pendingPasses}
          description="Awaiting approval"
          icon={<Ticket className="w-5 h-5" />}
          variant={pendingPasses > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Active Complaints"
          value={activeTickets}
          description="Unresolved issues"
          icon={<Wrench className="w-5 h-5" />}
          variant={activeTickets > 0 ? 'primary' : 'default'}
        />
        <StatCard
          title="Late Comers"
          value={lateComers}
          description="Not checked in"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={lateComers > 0 ? 'destructive' : 'success'}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAttendance?.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success text-xs font-semibold">
                      {record.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{record.user_name}</p>
                      <p className="text-xs text-muted-foreground">{record.room_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={record.type} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!todayAttendance || todayAttendance.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No attendance records today</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gatePasses?.filter(p => p.status === 'pending').slice(0, 5).map((pass) => (
                <div key={pass.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{pass.user_name}</p>
                    <p className="text-xs text-muted-foreground">{pass.destination}</p>
                  </div>
                  <StatusBadge status={pass.status} />
                </div>
              ))}
              {(!gatePasses || gatePasses.filter(p => p.status === 'pending').length === 0) && (
                <p className="text-center text-muted-foreground py-4">No pending approvals</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AttendanceListPage = () => {
  const [search, setSearch] = useState('');
  const { records: attendance, isLoading } = useAttendanceRecords();
  
  const filtered = attendance?.filter(r =>
    r.user_name.toLowerCase().includes(search.toLowerCase()) ||
    r.room_number.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Today's Attendance</h1>
        <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {record.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{record.user_name}</p>
                    <p className="text-sm text-muted-foreground">{record.room_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={record.type} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No attendance records found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const GatePassManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { passes, isLoading, refetch } = useGatePasses();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');

  const handleApprove = async (id: string) => {
    const qrCode = `GATEPASS-${id}-${Date.now()}`;
    const { error } = await supabase
      .from('gate_passes')
      .update({ 
        status: 'approved', 
        qr_code: qrCode, 
        approved_at: new Date().toISOString(),
        approved_by: user?.id 
      })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve gate pass',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Gate Pass Approved',
        description: 'QR code has been generated for the student',
      });
      refetch();
    }
  };

  const handleDeny = async (id: string) => {
    const { error } = await supabase
      .from('gate_passes')
      .update({ status: 'denied' })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to deny gate pass',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Gate Pass Denied',
        description: 'The request has been rejected',
      });
      refetch();
    }
  };

  const filtered = passes?.filter(p => filter === 'all' || p.status === filter)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Gate Pass Requests</h1>
        <p className="text-muted-foreground">Approve or deny leave requests</p>
      </div>

      <div className="flex gap-2">
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((pass) => (
          <Card key={pass.id} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{pass.user_name}</p>
                    <StatusBadge status={pass.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">Room {pass.room_number}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><span className="text-muted-foreground">Destination:</span> {pass.destination}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Reason:</span> {pass.reason}</p>
                    <p className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(pass.departure_date).toLocaleDateString()} - {new Date(pass.expected_return).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {pass.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" onClick={() => handleApprove(pass.id)}>
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeny(pass.id)}>
                      <XCircle className="w-4 h-4" />
                      Deny
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-8 text-center">
              <Ticket className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-3 text-muted-foreground">No gate pass requests found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const ComplaintsManagement = () => {
  const { toast } = useToast();
  const { tickets, isLoading, refetch } = useMaintenanceTickets();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');

  const handleAssign = async (id: string, assignee: string) => {
    const { error } = await supabase
      .from('maintenance_tickets')
      .update({ status: 'in-progress', assigned_to: assignee })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign ticket',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Technician Assigned',
        description: `Ticket assigned to ${assignee}`,
      });
      refetch();
    }
  };

  const handleResolve = async (id: string) => {
    const { error } = await supabase
      .from('maintenance_tickets')
      .update({ status: 'resolved' })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve ticket',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Ticket Resolved',
        description: 'The complaint has been marked as resolved',
      });
      refetch();
    }
  };

  const filtered = tickets?.filter(t => filter === 'all' || t.status === filter)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Complaints</h1>
        <p className="text-muted-foreground">Manage maintenance tickets</p>
      </div>

      <div className="flex gap-2">
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((ticket) => (
          <Card key={ticket.id} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium capitalize">{ticket.category}</p>
                    <StatusBadge status={ticket.status} />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ticket.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                      ticket.priority === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{ticket.user_name} • Room {ticket.room_number}</p>
                  <p className="text-sm mt-2">{ticket.description}</p>
                  {ticket.assigned_to && (
                    <p className="text-xs text-muted-foreground mt-2">Assigned to: {ticket.assigned_to}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {ticket.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={() => handleAssign(ticket.id, 'Maintenance Staff')}>
                      Assign
                    </Button>
                  )}
                  {ticket.status !== 'resolved' && (
                    <Button size="sm" variant="success" onClick={() => handleResolve(ticket.id)}>
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-8 text-center">
              <Wrench className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="mt-3 text-muted-foreground">No complaints found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  const { records: todayAttendance, isLoading: attendanceLoading } = useAttendanceRecords();
  const { hostelmates, isLoading: hostelmatesLoading } = useHostelmates();
  const { tickets, isLoading: ticketsLoading } = useMaintenanceTickets();
  const { passes, isLoading: passesLoading } = useGatePasses();

  const isLoading = attendanceLoading || hostelmatesLoading || ticketsLoading || passesLoading;

  const totalStudents = hostelmates?.length || 0;
  const presentToday = new Set(
    todayAttendance?.filter(r => r.type === 'check-in').map(r => r.user_id)
  ).size;

  const ticketsByCategory = {
    plumbing: tickets?.filter(t => t.category === 'plumbing').length || 0,
    electrical: tickets?.filter(t => t.category === 'electrical').length || 0,
    wifi: tickets?.filter(t => t.category === 'wifi').length || 0,
    furniture: tickets?.filter(t => t.category === 'furniture').length || 0,
    other: tickets?.filter(t => t.category === 'other').length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Hostel statistics and insights</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">{presentToday} of {totalStudents} students present</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              Complaint Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {tickets?.filter(t => t.status === 'resolved').length || 0}/{tickets?.length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Tickets resolved</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              Gate Pass Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {passes?.filter(p => p.status === 'approved').length || 0}/{passes?.length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Passes approved</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Complaints by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(ticketsByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center gap-3">
                <span className="text-sm capitalize w-20">{category}</span>
                <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${(tickets?.length || 0) > 0 ? (count / (tickets?.length || 1)) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const WardenDashboardPage = () => {
  return (
    <AppLayout navigation={<WardenNav />}>
      <Routes>
        <Route index element={<WardenDashboard />} />
        <Route path="attendance" element={<AttendanceListPage />} />
        <Route path="gate-passes" element={<GatePassManagement />} />
        <Route path="complaints" element={<ComplaintsManagement />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/warden" replace />} />
      </Routes>
    </AppLayout>
  );
};
