-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  donor_id UUID,
  certificate_type TEXT NOT NULL DEFAULT 'donation',
  certificate_number TEXT NOT NULL UNIQUE,
  issued_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  donation_count INTEGER NOT NULL DEFAULT 1,
  blood_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
ON public.certificates
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own certificates (for future self-service features)
CREATE POLICY "Users can create their own certificates"
ON public.certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add foreign key to profiles
ALTER TABLE public.certificates
ADD CONSTRAINT certificates_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Add foreign key to donors
ALTER TABLE public.certificates
ADD CONSTRAINT certificates_donor_id_fkey
FOREIGN KEY (donor_id)
REFERENCES public.donors(id)
ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_donor_id ON public.certificates(donor_id);