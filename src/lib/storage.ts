import { User, AttendanceRecord, MaintenanceTicket, GatePass, MovementLog, HostelMate } from '@/types/hostel';

const STORAGE_KEYS = {
  CURRENT_USER: 'hostelflow_current_user',
  USERS: 'hostelflow_users',
  ATTENDANCE: 'hostelflow_attendance',
  TICKETS: 'hostelflow_tickets',
  GATE_PASSES: 'hostelflow_gate_passes',
  MOVEMENT_LOG: 'hostelflow_movement_log',
  HOSTELMATES: 'hostelflow_hostelmates',
};

// Initialize demo data
const initializeDemoData = () => {
  // Demo users
  const demoUsers: User[] = [
    { id: 'student-1', name: 'Aarav Sharma', email: 'aarav@college.edu', role: 'student', roomNumber: 'A-101', hostelBlock: 'Block A', studentId: 'STU001' },
    { id: 'student-2', name: 'Priya Patel', email: 'priya@college.edu', role: 'student', roomNumber: 'A-102', hostelBlock: 'Block A', studentId: 'STU002' },
    { id: 'student-3', name: 'Rahul Kumar', email: 'rahul@college.edu', role: 'student', roomNumber: 'B-201', hostelBlock: 'Block B', studentId: 'STU003' },
    { id: 'warden-1', name: 'Dr. Meera Nair', email: 'meera@college.edu', role: 'warden' },
    { id: 'security-1', name: 'Ravi Singh', email: 'ravi@college.edu', role: 'security' },
  ];

  // Demo hostelmates
  const demoHostelmates: HostelMate[] = [
    { id: 'hm-1', name: 'Aarav Sharma', roomNumber: 'A-101', hostelBlock: 'Block A', course: 'Computer Science', year: '3rd Year' },
    { id: 'hm-2', name: 'Priya Patel', roomNumber: 'A-102', hostelBlock: 'Block A', course: 'Electronics', year: '2nd Year' },
    { id: 'hm-3', name: 'Rahul Kumar', roomNumber: 'B-201', hostelBlock: 'Block B', course: 'Mechanical', year: '4th Year' },
    { id: 'hm-4', name: 'Sneha Reddy', roomNumber: 'A-103', hostelBlock: 'Block A', course: 'Civil Engineering', year: '2nd Year' },
    { id: 'hm-5', name: 'Vikram Joshi', roomNumber: 'B-202', hostelBlock: 'Block B', course: 'Computer Science', year: '3rd Year' },
    { id: 'hm-6', name: 'Ananya Das', roomNumber: 'A-104', hostelBlock: 'Block A', course: 'Biotechnology', year: '1st Year' },
    { id: 'hm-7', name: 'Karthik Iyer', roomNumber: 'B-203', hostelBlock: 'Block B', course: 'Electrical', year: '4th Year' },
    { id: 'hm-8', name: 'Divya Menon', roomNumber: 'A-105', hostelBlock: 'Block A', course: 'Chemistry', year: '3rd Year' },
  ];

  // Demo attendance
  const today = new Date().toISOString().split('T')[0];
  const demoAttendance: AttendanceRecord[] = [
    { id: 'att-1', userId: 'student-1', userName: 'Aarav Sharma', roomNumber: 'A-101', timestamp: `${today}T08:30:00`, type: 'check-in', location: { latitude: 28.6139, longitude: 77.2090 }, verified: true },
    { id: 'att-2', userId: 'student-2', userName: 'Priya Patel', roomNumber: 'A-102', timestamp: `${today}T09:15:00`, type: 'check-in', location: { latitude: 28.6139, longitude: 77.2090 }, verified: true },
  ];

  // Demo tickets
  const demoTickets: MaintenanceTicket[] = [
    { id: 'ticket-1', userId: 'student-1', userName: 'Aarav Sharma', roomNumber: 'A-101', category: 'wifi', description: 'WiFi connectivity is very slow in my room', status: 'pending', priority: 'medium', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'ticket-2', userId: 'student-3', userName: 'Rahul Kumar', roomNumber: 'B-201', category: 'plumbing', description: 'Bathroom tap is leaking', status: 'in-progress', priority: 'high', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString(), assignedTo: 'Suresh (Plumber)' },
  ];

  // Demo gate passes
  const demoGatePasses: GatePass[] = [
    { id: 'gp-1', userId: 'student-2', userName: 'Priya Patel', roomNumber: 'A-102', reason: 'Family Visit', destination: 'Home - Mumbai', departureDate: today, expectedReturn: new Date(Date.now() + 172800000).toISOString().split('T')[0], status: 'pending', createdAt: new Date().toISOString() },
  ];

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HOSTELMATES)) {
    localStorage.setItem(STORAGE_KEYS.HOSTELMATES, JSON.stringify(demoHostelmates));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(demoAttendance));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(demoTickets));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GATE_PASSES)) {
    localStorage.setItem(STORAGE_KEYS.GATE_PASSES, JSON.stringify(demoGatePasses));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MOVEMENT_LOG)) {
    localStorage.setItem(STORAGE_KEYS.MOVEMENT_LOG, JSON.stringify([]));
  }
};

initializeDemoData();

// User functions
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

// Attendance functions
export const getAttendanceRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : [];
};

export const addAttendanceRecord = (record: AttendanceRecord) => {
  const records = getAttendanceRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
};

export const getTodayAttendance = (): AttendanceRecord[] => {
  const today = new Date().toISOString().split('T')[0];
  return getAttendanceRecords().filter(r => r.timestamp.startsWith(today));
};

// Ticket functions
export const getTickets = (): MaintenanceTicket[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
  return data ? JSON.parse(data) : [];
};

export const addTicket = (ticket: MaintenanceTicket) => {
  const tickets = getTickets();
  tickets.push(ticket);
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
};

export const updateTicket = (id: string, updates: Partial<MaintenanceTicket>) => {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === id);
  if (index !== -1) {
    tickets[index] = { ...tickets[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }
};

// Gate pass functions
export const getGatePasses = (): GatePass[] => {
  const data = localStorage.getItem(STORAGE_KEYS.GATE_PASSES);
  return data ? JSON.parse(data) : [];
};

export const addGatePass = (gatePass: GatePass) => {
  const passes = getGatePasses();
  passes.push(gatePass);
  localStorage.setItem(STORAGE_KEYS.GATE_PASSES, JSON.stringify(passes));
};

export const updateGatePass = (id: string, updates: Partial<GatePass>) => {
  const passes = getGatePasses();
  const index = passes.findIndex(p => p.id === id);
  if (index !== -1) {
    passes[index] = { ...passes[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.GATE_PASSES, JSON.stringify(passes));
  }
};

export const getUserGatePasses = (userId: string): GatePass[] => {
  return getGatePasses().filter(p => p.userId === userId);
};

// Movement log functions
export const getMovementLog = (): MovementLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MOVEMENT_LOG);
  return data ? JSON.parse(data) : [];
};

export const addMovementLog = (log: MovementLog) => {
  const logs = getMovementLog();
  logs.push(log);
  localStorage.setItem(STORAGE_KEYS.MOVEMENT_LOG, JSON.stringify(logs));
};

// Hostelmates functions
export const getHostelmates = (): HostelMate[] => {
  const data = localStorage.getItem(STORAGE_KEYS.HOSTELMATES);
  return data ? JSON.parse(data) : [];
};

// Generate QR code data
export const generateQRCode = (gatePassId: string): string => {
  return `HOSTELFLOW:GATEPASS:${gatePassId}:${Date.now()}`;
};
