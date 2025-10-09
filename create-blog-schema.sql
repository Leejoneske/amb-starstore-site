-- ============================================
-- BLOG SYSTEM DATABASE SCHEMA
-- ============================================
-- This creates the complete blog system with posts, categories, and tags

-- 1. Create blog categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create blog tags table
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create blog post tags junction table
CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, tag_id)
);

-- 5. Create blog post likes table
CREATE TABLE IF NOT EXISTS public.blog_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 6. Create blog post views table
CREATE TABLE IF NOT EXISTS public.blog_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post_id ON public.blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id ON public.blog_post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_post_id ON public.blog_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_views_post_id ON public.blog_post_views(post_id);

-- 8. Create RLS policies
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_views ENABLE ROW LEVEL SECURITY;

-- 9. Blog categories policies
CREATE POLICY "Anyone can view blog categories" ON public.blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog categories" ON public.blog_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 10. Blog tags policies
CREATE POLICY "Anyone can view blog tags" ON public.blog_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog tags" ON public.blog_tags
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 11. Blog posts policies
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view their own posts" ON public.blog_posts
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authors can manage their own posts" ON public.blog_posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their own posts" ON public.blog_posts
  FOR UPDATE USING (author_id = auth.uid());

-- 12. Blog post tags policies
CREATE POLICY "Anyone can view blog post tags" ON public.blog_post_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog post tags" ON public.blog_post_tags
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 13. Blog post likes policies
CREATE POLICY "Anyone can view blog post likes" ON public.blog_post_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their own likes" ON public.blog_post_likes
  FOR ALL USING (user_id = auth.uid());

-- 14. Blog post views policies
CREATE POLICY "Anyone can insert blog post views" ON public.blog_post_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all blog post views" ON public.blog_post_views
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 15. Create functions for blog management
CREATE OR REPLACE FUNCTION public.increment_blog_post_view(post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert view record
  INSERT INTO public.blog_post_views (post_id, user_id, ip_address, user_agent)
  VALUES (post_id, auth.uid(), inet_client_addr(), current_setting('request.headers', true)::json->>'user-agent')
  ON CONFLICT DO NOTHING;
  
  -- Increment view count
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_blog_post_like(post_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  like_exists BOOLEAN;
  new_like_count INTEGER;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM public.blog_post_likes 
    WHERE post_id = toggle_blog_post_like.post_id AND user_id = auth.uid()
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM public.blog_post_likes 
    WHERE post_id = toggle_blog_post_like.post_id AND user_id = auth.uid();
  ELSE
    -- Add like
    INSERT INTO public.blog_post_likes (post_id, user_id)
    VALUES (toggle_blog_post_like.post_id, auth.uid());
  END IF;
  
  -- Update like count
  UPDATE public.blog_posts
  SET like_count = (
    SELECT COUNT(*) FROM public.blog_post_likes 
    WHERE post_id = toggle_blog_post_like.post_id
  )
  WHERE id = toggle_blog_post_like.post_id;
  
  -- Get new like count
  SELECT like_count INTO new_like_count
  FROM public.blog_posts
  WHERE id = toggle_blog_post_like.post_id;
  
  -- Return result
  result := json_build_object(
    'liked', NOT like_exists,
    'like_count', new_like_count
  );
  
  RETURN result;
END;
$$;

-- 16. Grant permissions
GRANT EXECUTE ON FUNCTION public.increment_blog_post_view(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_blog_post_like(UUID) TO authenticated;

-- 17. Insert sample data
INSERT INTO public.blog_categories (name, slug, description, color) VALUES
  ('Ambassador Program', 'ambassador-program', 'Updates and news about the ambassador program', '#3b82f6'),
  ('Success Stories', 'success-stories', 'Real stories from our successful ambassadors', '#10b981'),
  ('Tips & Tricks', 'tips-tricks', 'Helpful tips for maximizing your ambassador earnings', '#f59e0b'),
  ('Product Updates', 'product-updates', 'Latest updates about StarStore products and features', '#8b5cf6'),
  ('Community', 'community', 'Community highlights and ambassador spotlights', '#ef4444')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blog_tags (name, slug, color) VALUES
  ('Earnings', 'earnings', '#10b981'),
  ('Referrals', 'referrals', '#3b82f6'),
  ('Social Media', 'social-media', '#8b5cf6'),
  ('Marketing', 'marketing', '#f59e0b'),
  ('Community', 'community', '#ef4444'),
  ('Tutorial', 'tutorial', '#06b6d4'),
  ('Case Study', 'case-study', '#84cc16'),
  ('Announcement', 'announcement', '#f97316')
ON CONFLICT (slug) DO NOTHING;

-- 18. Success message
SELECT 'Blog system created successfully!' as status;