import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Send, Wifi, Droplets, Zap, Armchair, HelpCircle } from 'lucide-react';
import { useMaintenanceTickets, MaintenanceTicket } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/ui/status-badge';

const categoryIcons = {
  plumbing: Droplets,
  electrical: Zap,
  wifi: Wifi,
  furniture: Armchair,
  other: HelpCircle,
};

export const MaintenanceForm = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { addTicket } = useMaintenanceTickets();
  const [category, setCategory] = useState<MaintenanceTicket['category']>('wifi');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenanceTicket['priority']>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !description.trim()) return;

    setIsSubmitting(true);

    try {
      await addTicket({
        user_id: user.id,
        user_name: profile.name,
        room_number: profile.room_number || 'N/A',
        category,
        description: description.trim(),
        status: 'pending',
        priority,
        assigned_to: null,
        resolution: null,
      });
      
      toast({
        title: 'Ticket Submitted',
        description: 'Your maintenance request has been logged',
      });

      setDescription('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit ticket. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          Report an Issue
        </CardTitle>
        <CardDescription>
          Submit a maintenance request for your room
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MaintenanceTicket['category'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plumbing">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Plumbing
                  </div>
                </SelectItem>
                <SelectItem value="electrical">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Electrical
                  </div>
                </SelectItem>
                <SelectItem value="wifi">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    WiFi / Network
                  </div>
                </SelectItem>
                <SelectItem value="furniture">
                  <div className="flex items-center gap-2">
                    <Armchair className="w-4 h-4" />
                    Furniture
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Other
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as MaintenanceTicket['priority'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Can wait a few days</SelectItem>
                <SelectItem value="medium">Medium - Needs attention soon</SelectItem>
                <SelectItem value="high">High - Urgent issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !description.trim()}>
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const MaintenanceList = () => {
  const { getUserTickets, isLoading } = useMaintenanceTickets();
  const tickets = getUserTickets();

  if (isLoading) {
    return (
      <Card className="shadow-card animate-fade-in">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className="shadow-card animate-fade-in">
        <CardContent className="py-8 text-center">
          <Wrench className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">No maintenance tickets yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const Icon = categoryIcons[ticket.category];
        return (
          <Card key={ticket.id} className="shadow-card animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm capitalize">{ticket.category}</p>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    {ticket.assigned_to && (
                      <span>Assigned: {ticket.assigned_to}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
