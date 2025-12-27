import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle2, XCircle, Shield, Loader2, Radio } from 'lucide-react';
import { useAttendanceRecords } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LocationMap } from './LocationMap';
import { SuccessAnimation } from './SuccessAnimation';

// Hostel coordinates
const HOSTEL_LOCATION = {
  latitude: 21.234776,
  longitude: 81.346385,
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
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { addRecord, getTodayRecord } = useAttendanceRecords();
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'verified' | 'outside'>('idle');
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const record = getTodayRecord();
    if (record) {
      setTodayRecord(record);
    }
  }, [getTodayRecord]);

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
        
        const dist = calculateDistance(
          latitude, 
          longitude, 
          HOSTEL_LOCATION.latitude, 
          HOSTEL_LOCATION.longitude
        );
        setDistance(dist);
        
        if (dist <= HOSTEL_LOCATION.radius) {
          setLocationStatus('verified');
        } else {
          setLocationStatus('outside');
        }
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

  const handleCheckIn = async () => {
    if (!user || !profile || !currentLocation || locationStatus !== 'verified') return;

    setIsSubmitting(true);
    const timestamp = new Date().toISOString();

    try {
      // Save to database
      const record = await addRecord({
        user_id: user.id,
        user_name: profile.name,
        room_number: profile.room_number || 'N/A',
        timestamp,
        type: 'check-in',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        verified: true,
        selfie_url: null,
      });

      // Send to Google Sheets
      try {
        const { error: sheetsError } = await supabase.functions.invoke('send-to-sheets', {
          body: {
            name: profile.name,
            timestamp,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            room_number: profile.room_number || 'N/A',
          },
        });

        if (sheetsError) {
          console.error('Google Sheets error:', sheetsError);
        }
      } catch (sheetsErr) {
        console.error('Failed to send to Google Sheets:', sheetsErr);
      }

      setTodayRecord(record);
      setShowSuccess(true);
    } catch (error) {
      console.error('Check-in error:', error);
      toast({
        title: 'Error',
        description: 'Failed to check in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return <SuccessAnimation onComplete={() => setShowSuccess(false)} />;
  }

  if (todayRecord) {
    return (
      <Card className="bg-slate-900 border-slate-700 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            Attendance Verified
          </CardTitle>
          <CardDescription className="text-slate-400">
            Your attendance has been successfully recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-700/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-600/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-emerald-300">
                  Checked in at {new Date(todayRecord.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-sm text-slate-400">
                  Location verified • Room {todayRecord.room_number}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700 shadow-2xl overflow-hidden">
      {/* Header with security badge */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">GPS Attendance Verification</h2>
            <p className="text-sm text-slate-400">Secure location-based check-in</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Location Status Panel */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
          <div className="px-4 py-3 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${locationStatus === 'checking' ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-sm font-medium text-slate-300">Location Status</span>
            </div>
          </div>
          
          <div className="p-6">
            {locationStatus === 'idle' && (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-700/50 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Location Not Verified</p>
                  <p className="text-sm text-slate-500">Click below to verify your location</p>
                </div>
              </div>
            )}
            
            {locationStatus === 'checking' && (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-indigo-900/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <div>
                  <p className="text-indigo-300 font-medium">Acquiring Location...</p>
                  <p className="text-sm text-slate-500">Please wait while we verify your position</p>
                </div>
              </div>
            )}
            
            {locationStatus === 'verified' && (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-900/50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-300 font-medium">Location Verified</p>
                  <p className="text-sm text-slate-500">
                    You are {distance?.toFixed(0)}m from hostel (within 100m radius)
                  </p>
                </div>
              </div>
            )}
            
            {locationStatus === 'outside' && currentLocation && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-900/50 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <p className="text-red-300 font-medium">Outside Allowed Area</p>
                    <p className="text-sm text-slate-500">
                      You must be within 100m of the hostel to check in
                    </p>
                  </div>
                </div>
                
                {/* Map Visualization */}
                <LocationMap
                  userLocation={currentLocation}
                  hostelLocation={HOSTEL_LOCATION}
                  distance={distance || 0}
                />
              </div>
            )}
          </div>
        </div>

        {/* Coordinates Display */}
        {currentLocation && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Latitude</p>
              <p className="text-sm font-mono text-slate-300">{currentLocation.latitude.toFixed(6)}</p>
            </div>
            <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Longitude</p>
              <p className="text-sm font-mono text-slate-300">{currentLocation.longitude.toFixed(6)}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {locationStatus !== 'verified' && (
            <Button
              onClick={checkLocation}
              disabled={isChecking}
              variant="outline"
              className="w-full h-12 bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-indigo-500 hover:text-indigo-300"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying Location...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  Verify My Location
                </>
              )}
            </Button>
          )}

          <Button
            onClick={handleCheckIn}
            disabled={locationStatus !== 'verified' || isSubmitting}
            className={`w-full h-14 text-lg font-semibold transition-all duration-300 ${
              locationStatus === 'verified'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Marking Attendance...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Mark Attendance
              </>
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-900/20 border border-indigo-800/30">
          <Shield className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Your location data is encrypted and securely transmitted. Attendance is verified using GPS coordinates within a 100-meter radius of the hostel.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
