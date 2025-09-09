-- 1) Trigger to auto-create public.users row on auth signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();
  END IF;
END;
$$;

-- 2) Validation function to ensure transaction_pin is exactly 4 digits
CREATE OR REPLACE FUNCTION public.validate_transaction_pin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Allow nulls to pass through (in case of partial updates without pin)
  IF NEW.transaction_pin IS NULL THEN
    RETURN NEW;
  END IF;

  -- Enforce exactly 4 numeric digits
  IF NEW.transaction_pin !~ '^[0-9]{4}$' THEN
    RAISE EXCEPTION 'transaction_pin must be exactly 4 digits'
      USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Attach validation trigger on users table for inserts/updates of transaction_pin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'validate_users_pin_before_write'
  ) THEN
    CREATE TRIGGER validate_users_pin_before_write
    BEFORE INSERT OR UPDATE OF transaction_pin ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_transaction_pin();
  END IF;
END;
$$;

-- 4) Keep updated_at in sync on updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END;
$$;