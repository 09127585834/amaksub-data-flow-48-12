-- Create data bundle beneficiaries table
CREATE TABLE public.data_bundle_beneficiaries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  mobile_number text NOT NULL,
  mobile_network text NOT NULL,
  network_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, mobile_number, mobile_network)
);

-- Enable Row Level Security
ALTER TABLE public.data_bundle_beneficiaries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own data bundle beneficiaries" 
ON public.data_bundle_beneficiaries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data bundle beneficiaries" 
ON public.data_bundle_beneficiaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data bundle beneficiaries" 
ON public.data_bundle_beneficiaries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data bundle beneficiaries" 
ON public.data_bundle_beneficiaries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_data_bundle_beneficiaries_updated_at
BEFORE UPDATE ON public.data_bundle_beneficiaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();