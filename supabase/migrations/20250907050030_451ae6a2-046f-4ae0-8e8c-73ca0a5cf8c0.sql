-- Create a function to check if user data exists (for signup validation)
CREATE OR REPLACE FUNCTION public.check_user_field_exists(
  field_name text,
  field_value text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  field_exists boolean := false;
BEGIN
  -- Validate field_name to prevent SQL injection
  IF field_name NOT IN ('email', 'username', 'phone_number') THEN
    RAISE EXCEPTION 'Invalid field name. Only email, username, and phone_number are allowed.';
  END IF;
  
  -- Check if the field value exists
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM users WHERE %I = $1)', field_name)
  INTO field_exists
  USING field_value;
  
  RETURN field_exists;
END;
$$;