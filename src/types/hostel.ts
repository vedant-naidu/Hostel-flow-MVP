export type UserRole = 'student' | 'warden' | 'security';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roomNumber?: string;
  hostelBlock?: string;
  studentId?: string;
  profileImage?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  roomNumber: string;
  timestamp: string;
  type: 'check-in' | 'check-out';
  location: {
    latitude: number;
    longitude: number;
  };
  verified: boolean;
  selfieUrl?: string;
}

export interface MaintenanceTicket {
  id: string;
  userId: string;
  userName: string;
  roomNumber: string;
  category: 'plumbing' | 'electrical' | 'wifi' | 'furniture' | 'other';
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
}

export interface GatePass {
  id: string;
  userId: string;
  userName: string;
  roomNumber: string;
  reason: string;
  destination: string;
  departureDate: string;
  expectedReturn: string;
  status: 'pending' | 'approved' | 'denied';
  qrCode?: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  exitTime?: string;
  entryTime?: string;
}

export interface MovementLog {
  id: string;
  gatePassId: string;
  userId: string;
  userName: string;
  type: 'exit' | 'entry';
  timestamp: string;
  scannedBy: string;
}

export interface HostelMate {
  id: string;
  name: string;
  roomNumber: string;
  hostelBlock: string;
  course?: string;
  year?: string;
}
