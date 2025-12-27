import { MapPin, Navigation } from 'lucide-react';

interface LocationMapProps {
  userLocation: { latitude: number; longitude: number };
  hostelLocation: { latitude: number; longitude: number };
  distance: number;
}

export const LocationMap = ({ userLocation, hostelLocation, distance }: LocationMapProps) => {
  // Calculate relative positions for visualization
  const latDiff = userLocation.latitude - hostelLocation.latitude;
  const lonDiff = userLocation.longitude - hostelLocation.longitude;
  
  // Normalize for display (scale to fit in container)
  const maxDiff = Math.max(Math.abs(latDiff), Math.abs(lonDiff), 0.001);
  const scale = 40; // percentage from center
  
  const userX = 50 + (lonDiff / maxDiff) * scale;
  const userY = 50 - (latDiff / maxDiff) * scale;

  return (
    <div className="w-full rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900">
      {/* Map Header */}
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
        <Navigation className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-slate-200">Location Comparison</span>
      </div>
      
      {/* Map Visualization */}
      <div className="relative h-64 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-slate-500" style={{ top: `${(i + 1) * 10}%` }} />
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-slate-500" style={{ left: `${(i + 1) * 10}%` }} />
          ))}
        </div>
        
        {/* Hostel radius circle */}
        <div 
          className="absolute w-24 h-24 rounded-full border-2 border-dashed border-indigo-500/50 bg-indigo-500/10"
          style={{ 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)' 
          }}
        />
        
        {/* Hostel marker (center) */}
        <div 
          className="absolute z-10"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-medium text-indigo-300 bg-slate-800/90 px-2 py-0.5 rounded">
                Hostel
              </span>
            </div>
          </div>
        </div>
        
        {/* User marker */}
        <div 
          className="absolute z-20"
          style={{ 
            left: `${Math.max(10, Math.min(90, userX))}%`, 
            top: `${Math.max(10, Math.min(90, userY))}%`, 
            transform: 'translate(-50%, -50%)' 
          }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-red-400 flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-medium text-red-300 bg-slate-800/90 px-2 py-0.5 rounded">
                You
              </span>
            </div>
          </div>
        </div>
        
        {/* Distance line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="50%"
            y1="50%"
            x2={`${Math.max(10, Math.min(90, userX))}%`}
            y2={`${Math.max(10, Math.min(90, userY))}%`}
            stroke="rgb(239 68 68)"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
          />
        </svg>
      </div>
      
      {/* Distance info */}
      <div className="bg-slate-800 px-4 py-3 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-slate-300">Your Location</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-red-400">{distance.toFixed(0)}m away</p>
            <p className="text-xs text-slate-500">Must be within 100m</p>
          </div>
        </div>
      </div>
    </div>
  );
};
