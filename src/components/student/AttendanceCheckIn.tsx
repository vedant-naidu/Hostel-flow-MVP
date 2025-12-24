import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle2, XCircle, Camera, Loader2 } from 'lucide-react';
import { addAttendanceRecord, getTodayAttendance } from '@/lib/storage';
import { AttendanceRecord } from '@/types/hostel';
import { useToast } from '@/hooks/use-toast';

// Simulated hostel location (can be adjusted)
const HOSTEL_LOCATION = {
  latitude: 28.6139,
  longitude: 77.2090,
  radius: 100, // meters
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const AttendanceCheckIn = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'verified' | 'outside'>('idle');
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    // Check if already checked in today
    const records = getTodayAttendance();
    const userRecord = records.find(r => r.userId === user?.id && r.type === 'check-in');
    if (userRecord) {
      setTodayRecord(userRecord);
    }
  }, [user]);

  const checkLocation = () => {
    setLocationStatus('checking');
    setIsChecking(true);

    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      setLocationStatus('idle');
      setIsChecking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });

        const distance = calculateDistance(
          latitude,
          longitude,
          HOSTEL_LOCATION.latitude,
          HOSTEL_LOCATION.longitude
        );

        // For demo purposes, we'll consider any location as verified
        // In production, uncomment the distance check
        // if (distance <= HOSTEL_LOCATION.radius) {
        setLocationStatus('verified');
        // } else {
        //   setLocationStatus('outside');
        // }
        setIsChecking(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: 'Location Error',
          description: 'Unable to get your location. Please enable location services.',
          variant: 'destructive',
        });
        setLocationStatus('idle');
        setIsChecking(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckIn = () => {
    if (!user || !currentLocation) return;

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      roomNumber: user.roomNumber || 'N/A',
      timestamp: new Date().toISOString(),
      type: 'check-in',
      location: currentLocation,
      verified: true,
    };

    addAttendanceRecord(record);
    setTodayRecord(record);
    
    toast({
      title: 'Check-in Successful! ✓',
      description: `Attendance marked at ${new Date().toLocaleTimeString()}`,
    });
  };

  if (todayRecord) {
    return (
      <Card className="shadow-card animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Already Checked In
          </CardTitle>
          <CardDescription>
            You've marked your attendance for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-sm font-medium text-success">
              Checked in at {new Date(todayRecord.timestamp).toLocaleTimeString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Location verified • {todayRecord.roomNumber}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          GPS Check-In
        </CardTitle>
        <CardDescription>
          Mark your attendance with location verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Status */}
        <div className="p-4 rounded-lg bg-secondary border border-border">
          {locationStatus === 'idle' && (
            <div className="text-center space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Verify your location to enable check-in
              </p>
            </div>
          )}
          {locationStatus === 'checking' && (
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                Checking your location...
              </p>
            </div>
          )}
          {locationStatus === 'verified' && (
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-success" />
              <p className="text-sm font-medium text-success">
                Location Verified
              </p>
              <p className="text-xs text-muted-foreground">
                You're within hostel premises
              </p>
            </div>
          )}
          {locationStatus === 'outside' && (
            <div className="text-center space-y-2">
              <XCircle className="w-8 h-8 mx-auto text-destructive" />
              <p className="text-sm font-medium text-destructive">
                Outside Hostel Range
              </p>
              <p className="text-xs text-muted-foreground">
                You must be within 100m of the hostel to check in
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {locationStatus !== 'verified' && (
            <Button
              onClick={checkLocation}
              disabled={isChecking}
              variant="outline"
              className="w-full"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking Location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Verify Location
                </>
              )}
            </Button>
          )}

          <Button
            onClick={handleCheckIn}
            disabled={locationStatus !== 'verified'}
            variant="gradient-success"
            size="lg"
            className="w-full"
          >
            <CheckCircle2 className="w-5 h-5" />
            Check In Now
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={locationStatus !== 'verified'}
          >
            <Camera className="w-4 h-4" />
            Add Selfie (Optional)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
