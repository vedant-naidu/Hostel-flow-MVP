import { cn } from '@/lib/utils';

type StatusType = 'pending' | 'approved' | 'denied' | 'in-progress' | 'resolved' | 'check-in' | 'check-out';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  approved: {
    label: 'Approved',
    className: 'bg-success/10 text-success border-success/20',
  },
  denied: {
    label: 'Denied',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-accent/10 text-accent border-accent/20',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-success/10 text-success border-success/20',
  },
  'check-in': {
    label: 'Check In',
    className: 'bg-success/10 text-success border-success/20',
  },
  'check-out': {
    label: 'Check Out',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
