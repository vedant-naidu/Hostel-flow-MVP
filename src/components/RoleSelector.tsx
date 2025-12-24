import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Building2, GraduationCap, Shield, UserCog } from 'lucide-react';
import { UserRole } from '@/types/hostel';

export const RoleSelector = () => {
  const { login } = useAuth();

  const roles: { role: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
    {
      role: 'student',
      label: 'Student',
      description: 'Mark attendance, request gate passes, submit maintenance tickets',
      icon: <GraduationCap className="w-8 h-8" />,
    },
    {
      role: 'warden',
      label: 'Warden',
      description: 'Manage attendance, approve passes, handle complaints',
      icon: <UserCog className="w-8 h-8" />,
    },
    {
      role: 'security',
      label: 'Security Guard',
      description: 'Scan QR codes, log entry/exit movements',
      icon: <Shield className="w-8 h-8" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 animate-slide-up">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-elevated">
            <Building2 className="w-9 h-9 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">HostelFlow</h1>
            <p className="text-muted-foreground mt-1">Smart Hostel Management System</p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">Select your role to continue</p>
          
          {roles.map((item) => (
            <button
              key={item.role}
              onClick={() => login(item.role)}
              className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/30 transition-all duration-200 shadow-card hover:shadow-elevated text-left flex items-center gap-4 group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Demo mode • Data persists in local storage
        </p>
      </div>
    </div>
  );
};
