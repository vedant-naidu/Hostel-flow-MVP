import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Ticket, Send, QrCode, Clock } from 'lucide-react';
import { useGatePasses } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/ui/status-badge';

export const GatePassForm = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { addGatePass } = useGatePasses();
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !reason.trim() || !destination.trim() || !departureDate || !expectedReturn) return;

    setIsSubmitting(true);

    try {
      await addGatePass({
        user_id: user.id,
        user_name: profile.name,
        room_number: profile.room_number || 'N/A',
        reason: reason.trim(),
        destination: destination.trim(),
        departure_date: departureDate,
        expected_return: expectedReturn,
        status: 'pending',
      });
      
      toast({
        title: 'Gate Pass Requested',
        description: 'Your request has been sent to the warden for approval',
      });

      setReason('');
      setDestination('');
      setDepartureDate('');
      setExpectedReturn('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit gate pass request. Please try again.',
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
          <Ticket className="w-5 h-5 text-primary" />
          Request Gate Pass
        </CardTitle>
        <CardDescription>
          Apply for leave permission from the hostel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Reason for Leave</Label>
            <Textarea
              placeholder="e.g., Family function, Medical appointment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Destination</Label>
            <Input
              placeholder="e.g., Home - Mumbai, Hospital"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Departure Date</Label>
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Return</Label>
              <Input
                type="date"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                min={departureDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const GatePassList = () => {
  const { getUserPasses, isLoading } = useGatePasses();
  const passes = getUserPasses();

  if (isLoading) {
    return (
      <Card className="shadow-card animate-fade-in">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (passes.length === 0) {
    return (
      <Card className="shadow-card animate-fade-in">
        <CardContent className="py-8 text-center">
          <Ticket className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">No gate pass requests yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {passes.map((pass) => (
        <Card key={pass.id} className="shadow-card animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{pass.destination}</p>
                  <StatusBadge status={pass.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{pass.reason}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(pass.departure_date).toLocaleDateString()} - {new Date(pass.expected_return).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {pass.status === 'approved' && (
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-[10px] text-center mt-1 text-muted-foreground">QR Code</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
