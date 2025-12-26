import { NavLink, useLocation } from 'react-router-dom';
import { MapPin, Wrench, Ticket, Users, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/student/attendance', icon: MapPin, label: 'Attendance' },
  { to: '/student/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/student/gate-pass', icon: Ticket, label: 'Gate Pass' },
  { to: '/student/directory', icon: Users, label: 'Directory' },
];

export const StudentNav = () => {
  const location = useLocation();

  return (
    <nav className="p-4 space-y-1">
      {navItems.map((item) => {
        const isActive = item.end 
          ? location.pathname === item.to 
          : location.pathname.startsWith(item.to);
        
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
