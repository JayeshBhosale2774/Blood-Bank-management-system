-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('person', 'hospital');

-- Create enum for blood groups
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'person',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create donors table
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 65),
  blood_group blood_group NOT NULL,
  contact TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on donors
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- Donors policies
CREATE POLICY "Anyone can view available donors" ON public.donors
  FOR SELECT USING (available = true);

CREATE POLICY "Users can insert their own donor profile" ON public.donors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own donor profile" ON public.donors
  FOR UPDATE USING (auth.uid() = user_id);

-- Create blood_banks table
CREATE TABLE public.blood_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on blood_banks
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;

-- Blood banks policies
CREATE POLICY "Anyone can view blood banks" ON public.blood_banks
  FOR SELECT USING (true);

CREATE POLICY "Hospitals can insert their profile" ON public.blood_banks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hospitals can update their profile" ON public.blood_banks
  FOR UPDATE USING (auth.uid() = user_id);

-- Create blood_stock table
CREATE TABLE public.blood_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_bank_id UUID REFERENCES public.blood_banks(id) ON DELETE CASCADE NOT NULL,
  blood_group blood_group NOT NULL,
  available_units INTEGER NOT NULL DEFAULT 0 CHECK (available_units >= 0),
  exchange_available BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blood_bank_id, blood_group)
);

-- Enable RLS on blood_stock
ALTER TABLE public.blood_stock ENABLE ROW LEVEL SECURITY;

-- Blood stock policies
CREATE POLICY "Anyone can view blood stock" ON public.blood_stock
  FOR SELECT USING (true);

CREATE POLICY "Hospitals can manage their stock" ON public.blood_stock
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.blood_banks
      WHERE blood_banks.id = blood_stock.blood_bank_id
      AND blood_banks.user_id = auth.uid()
    )
  );

-- Create requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  requester_name TEXT NOT NULL,
  blood_group blood_group NOT NULL,
  hospital_id UUID REFERENCES public.blood_banks(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Requests policies
CREATE POLICY "Users can view their own requests" ON public.requests
  FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "Users can create requests" ON public.requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Hospitals can view requests for their bank" ON public.requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blood_banks
      WHERE blood_banks.id = requests.hospital_id
      AND blood_banks.user_id = auth.uid()
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'person')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate distance using Haversine formula
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  earth_radius DECIMAL := 6371; -- Earth's radius in kilometers
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat / 2) * sin(dlat / 2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon / 2) * sin(dlon / 2);
  
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  
  RETURN earth_radius * c;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_blood_banks
  BEFORE UPDATE ON public.blood_banks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_blood_stock
  BEFORE UPDATE ON public.blood_stock
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_requests
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();