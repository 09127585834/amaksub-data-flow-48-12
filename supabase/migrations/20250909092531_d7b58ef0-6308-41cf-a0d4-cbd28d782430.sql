-- 1) Add reward_balance with default 0.00
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS reward_balance numeric NOT NULL DEFAULT 0.00;

-- 2) Backfill referral_code to be exactly username for all existing rows
UPDATE public.users
SET referral_code = username
WHERE referral_code IS DISTINCT FROM username;

-- 3) Create a trigger to keep referral_code in sync with username
CREATE OR REPLACE FUNCTION public.sync_referral_code_with_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.referral_code := NEW.username;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_referral_code ON public.users;

CREATE TRIGGER trg_sync_referral_code
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_referral_code_with_username();