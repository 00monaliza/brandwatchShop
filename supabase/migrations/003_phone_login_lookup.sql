-- Phone login helper: safely resolve auth email by phone before sign-in.
-- Uses SECURITY DEFINER to bypass profiles RLS for this exact lookup only.

CREATE OR REPLACE FUNCTION public.get_profile_email_by_phone(p_phone text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM public.profiles
  WHERE phone = p_phone
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_profile_email_by_phone(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_profile_email_by_phone(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_profile_email_by_phone(text) TO authenticated;
