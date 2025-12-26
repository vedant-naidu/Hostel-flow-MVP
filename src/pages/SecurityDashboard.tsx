import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Scan, QrCode, CheckCircle2, LogIn, LogOut, Clock } from 'lucide-react';
import { useGatePasses, useMovementLogs } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const SecurityDashboardPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { getApprovedPasses, updateGatePass } = useGatePasses();
  const { logs, addLog } = useMovementLogs();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPass, setScannedPass] = useState<any | null>(null);

  const simulateScan = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      const approvedPasses = getApprovedPasses();
      if (approvedPasses.length > 0) {
        const randomPass = approvedPasses[Math.floor(Math.random() * approvedPasses.length)];
        setScannedPass(randomPass);
      } else {
        toast({
          title: 'No Valid Pass Found',
          description: 'No approved gate passes in the system',
          variant: 'destructive',
        });
      }
      setIsScanning(false);
    }, 1500);
  };

  const logMovement = async (type: 'exit' | 'entry') => {
    if (!scannedPass || !user || !profile) return;

    try {
      await addLog({
        gate_pass_id: scannedPass.id,
        user_id: scannedPass.user_id,
        user_name: scannedPass.user_name,
        type,
        scanned_by: user.id,
      });
      
      if (type === 'exit') {
        await updateGatePass(scannedPass.id, { exit_time: new Date().toISOString() });
      } else {
        await updateGatePass(scannedPass.id, { entry_time: new Date().toISOString() });
      }

      setScannedPass(null);

      toast({
        title: `${type === 'exit' ? 'Exit' : 'Entry'} Logged`,
        description: `${scannedPass.user_name} - ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log movement',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Security Scanner</h1>
          <p className="text-muted-foreground">Scan student QR codes for entry/exit</p>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-6">
            {!scannedPass ? (
              <div className="text-center space-y-4">
                <div className={`w-40 h-40 mx-auto rounded-2xl border-4 border-dashed border-primary/30 flex items-center justify-center ${isScanning ? 'animate-pulse' : ''}`}>
                  {isScanning ? (
                    <div className="text-center">
                      <Scan className="w-12 h-12 text-primary animate-pulse mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Scanning...</p>
                    </div>
                  ) : (
                    <QrCode className="w-16 h-16 text-muted-foreground/50" />
                  )}
                </div>
                
                <Button onClick={simulateScan} disabled={isScanning} variant="gradient" size="lg" className="w-full max-w-xs">
                  <Scan className="w-5 h-5" />
                  {isScanning ? 'Scanning...' : 'Scan QR Code'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
                  <h3 className="font-semibold text-lg">Valid Pass Found</h3>
                </div>
                
                <div className="p-4 rounded-lg bg-secondary space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{scannedPass.user_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room:</span>
                    <span>{scannedPass.room_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination:</span>
                    <span>{scannedPass.destination}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => logMovement('exit')} variant="warning" size="lg">
                    <LogOut className="w-5 h-5" /> Log Exit
                  </Button>
                  <Button onClick={() => logMovement('entry')} variant="success" size="lg">
                    <LogIn className="w-5 h-5" /> Log Entry
                  </Button>
                </div>
                <Button onClick={() => setScannedPass(null)} variant="outline" className="w-full">Cancel</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Movement Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.type === 'exit' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                      {log.type === 'exit' ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{log.user_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{log.type}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
              {logs.length === 0 && <p className="text-center text-muted-foreground py-4">No movements logged</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};
