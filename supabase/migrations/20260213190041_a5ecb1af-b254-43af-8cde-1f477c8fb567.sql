-- Grant necessary privileges on managers table
GRANT SELECT, INSERT ON public.managers TO anon;
GRANT SELECT, INSERT ON public.managers TO authenticated;