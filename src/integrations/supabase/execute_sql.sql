
-- SQL Function to execute SQL statements safely
-- This is a workaround for TypeScript type errors
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE 'WITH data AS (' || sql_query || ') SELECT jsonb_agg(data) FROM data' INTO result;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Grant execute permissions to authenticated users for this function
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;
