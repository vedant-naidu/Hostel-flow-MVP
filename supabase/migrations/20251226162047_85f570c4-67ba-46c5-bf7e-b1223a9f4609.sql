-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'warden', 'security');

-- Create user roles table (for role-based access control)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    room_number TEXT,
    hostel_block TEXT,
    student_id TEXT,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hostelmates table
CREATE TABLE public.hostelmates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    hostel_block TEXT NOT NULL,
    course TEXT,
    year TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance records table
CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    type TEXT NOT NULL CHECK (type IN ('check-in', 'check-out')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    verified BOOLEAN DEFAULT false,
    selfie_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maintenance tickets table
CREATE TABLE public.maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('plumbing', 'electrical', 'wifi', 'furniture', 'other')),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to TEXT,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gate passes table
CREATE TABLE public.gate_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    reason TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_date DATE NOT NULL,
    expected_return DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    qr_code TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    exit_time TIMESTAMP WITH TIME ZONE,
    entry_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create movement logs table
CREATE TABLE public.movement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_pass_id UUID REFERENCES public.gate_passes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('exit', 'entry')),
    scanned_by UUID REFERENCES auth.users(id) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostelmates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for hostelmates
CREATE POLICY "Anyone can view hostelmates"
ON public.hostelmates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Wardens can manage hostelmates"
ON public.hostelmates FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'warden'));

-- RLS Policies for attendance_records
CREATE POLICY "Students can view their own attendance"
ON public.attendance_records FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'warden'));

CREATE POLICY "Students can insert their own attendance"
ON public.attendance_records FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Wardens can view all attendance"
ON public.attendance_records FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'warden'));

-- RLS Policies for maintenance_tickets
CREATE POLICY "Students can view their own tickets"
ON public.maintenance_tickets FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'warden'));

CREATE POLICY "Students can create tickets"
ON public.maintenance_tickets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Wardens can update any ticket"
ON public.maintenance_tickets FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'warden') OR user_id = auth.uid());

-- RLS Policies for gate_passes
CREATE POLICY "Students can view their own gate passes"
ON public.gate_passes FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'warden') OR public.has_role(auth.uid(), 'security'));

CREATE POLICY "Students can create gate passes"
ON public.gate_passes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Wardens can update gate passes"
ON public.gate_passes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'warden') OR public.has_role(auth.uid(), 'security'));

-- RLS Policies for movement_logs
CREATE POLICY "View movement logs"
ON public.movement_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'warden') OR public.has_role(auth.uid(), 'security'));

CREATE POLICY "Security can create movement logs"
ON public.movement_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'security'));

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, room_number, hostel_block, student_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data ->> 'room_number',
    NEW.raw_user_meta_data ->> 'hostel_block',
    NEW.raw_user_meta_data ->> 'student_id'
  );
  
  -- Assign role from metadata or default to student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'student')
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_tickets_updated_at
  BEFORE UPDATE ON public.maintenance_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gate_passes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.movement_logs;