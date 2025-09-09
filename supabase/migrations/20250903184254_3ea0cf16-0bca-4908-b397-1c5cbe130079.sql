-- Create webhook logs table for monitoring GSUBZ webhooks
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  webhook_data JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage webhook logs
CREATE POLICY "Service role can manage webhook logs" 
ON public.webhook_logs 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);