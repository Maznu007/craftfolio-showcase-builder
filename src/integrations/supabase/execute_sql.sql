
-- Create a table for template followers
CREATE TABLE IF NOT EXISTS public.template_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Add unique constraint to prevent duplicate follows
  UNIQUE(user_id, template_id)
);

-- Add RLS policies
ALTER TABLE public.template_followers ENABLE ROW LEVEL SECURITY;

-- Users can view their own follows
CREATE POLICY "Users can view their follows" ON public.template_followers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own follows
CREATE POLICY "Users can follow templates" ON public.template_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own follows
CREATE POLICY "Users can unfollow templates" ON public.template_followers
  FOR DELETE USING (auth.uid() = user_id);

-- Add count of portfolios by template view for admins
CREATE OR REPLACE VIEW public.template_usage_stats AS
SELECT 
  template_id,
  COUNT(*) as portfolio_count,
  COUNT(DISTINCT user_id) as unique_user_count
FROM public.portfolios
WHERE is_public = true
GROUP BY template_id
ORDER BY portfolio_count DESC;
