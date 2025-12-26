import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Types matching database schema
export interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  room_number: string;
  timestamp: string;
  type: 'check-in' | 'check-out';
  latitude: number;
  longitude: number;
  verified: boolean;
  selfie_url: string | null;
  created_at: string;
}

export interface MaintenanceTicket {
  id: string;
  user_id: string;
  user_name: string;
  room_number: string;
  category: 'plumbing' | 'electrical' | 'wifi' | 'furniture' | 'other';
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

export interface GatePass {
  id: string;
  user_id: string;
  user_name: string;
  room_number: string;
  reason: string;
  destination: string;
  departure_date: string;
  expected_return: string;
  status: 'pending' | 'approved' | 'denied';
  qr_code: string | null;
  approved_by: string | null;
  approved_at: string | null;
  exit_time: string | null;
  entry_time: string | null;
  created_at: string;
}

export interface MovementLog {
  id: string;
  gate_pass_id: string;
  user_id: string;
  user_name: string;
  type: 'exit' | 'entry';
  scanned_by: string;
  timestamp: string;
  created_at: string;
}

export interface Hostelmate {
  id: string;
  user_id: string | null;
  name: string;
  room_number: string;
  hostel_block: string;
  course: string | null;
  year: string | null;
  created_at: string;
}

// Attendance Hooks
export const useAttendanceRecords = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
    } else {
      setRecords(data as AttendanceRecord[]);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRecords();

    // Real-time subscription
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_records' },
        () => fetchRecords()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecords]);

  const addRecord = async (record: Omit<AttendanceRecord, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const getTodayRecord = () => {
    if (!user) return null;
    const today = new Date().toISOString().split('T')[0];
    return records.find(
      r => r.user_id === user.id && r.timestamp.startsWith(today)
    );
  };

  return { records, isLoading, addRecord, getTodayRecord, refetch: fetchRecords };
};

// Maintenance Tickets Hooks
export const useMaintenanceTickets = () => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTickets = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('maintenance_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
    } else {
      setTickets(data as MaintenanceTicket[]);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_tickets' },
        () => fetchTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTickets]);

  const addTicket = async (ticket: Omit<MaintenanceTicket, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .insert([ticket])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTicket = async (id: string, updates: Partial<MaintenanceTicket>) => {
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const getUserTickets = () => {
    if (!user) return [];
    return tickets.filter(t => t.user_id === user.id);
  };

  return { tickets, isLoading, addTicket, updateTicket, getUserTickets, refetch: fetchTickets };
};

// Gate Pass Hooks
export const useGatePasses = () => {
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchPasses = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('gate_passes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gate passes:', error);
    } else {
      setPasses(data as GatePass[]);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPasses();

    const channel = supabase
      .channel('gatepasses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gate_passes' },
        () => fetchPasses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPasses]);

  const addGatePass = async (pass: Omit<GatePass, 'id' | 'created_at' | 'qr_code' | 'approved_by' | 'approved_at' | 'exit_time' | 'entry_time'>) => {
    const { data, error } = await supabase
      .from('gate_passes')
      .insert([{
        ...pass,
        qr_code: `HOSTELFLOW:GATEPASS:${Date.now()}`,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateGatePass = async (id: string, updates: Partial<GatePass>) => {
    const { data, error } = await supabase
      .from('gate_passes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const getUserPasses = () => {
    if (!user) return [];
    return passes.filter(p => p.user_id === user.id);
  };

  const getApprovedPasses = () => {
    return passes.filter(p => p.status === 'approved');
  };

  return { passes, isLoading, addGatePass, updateGatePass, getUserPasses, getApprovedPasses, refetch: fetchPasses };
};

// Movement Log Hooks
export const useMovementLogs = () => {
  const [logs, setLogs] = useState<MovementLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('movement_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching movement logs:', error);
    } else {
      setLogs(data as MovementLog[]);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('movement-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movement_logs' },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  const addLog = async (log: Omit<MovementLog, 'id' | 'created_at' | 'timestamp'>) => {
    const { data, error } = await supabase
      .from('movement_logs')
      .insert([log])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return { logs, isLoading, addLog, refetch: fetchLogs };
};

// Hostelmates Hooks
export const useHostelmates = () => {
  const [hostelmates, setHostelmates] = useState<Hostelmate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHostelmates = useCallback(async () => {
    const { data, error } = await supabase
      .from('hostelmates')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching hostelmates:', error);
    } else {
      setHostelmates(data as Hostelmate[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchHostelmates();
  }, [fetchHostelmates]);

  return { hostelmates, isLoading, refetch: fetchHostelmates };
};
