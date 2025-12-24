import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Ticket, Wrench, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/warden', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/warden/attendance', icon: Users, label: 'Attendance' },
  { to: '/warden/gate-passes', icon: Ticket, label: 'Gate Passes' },
  { to: '/warden/complaints', icon: Wrench, label: 'Complaints' },
  { to: '/warden/analytics', icon: BarChart3, label: 'Analytics' },
];

export const WardenNav = () => {
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
