import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  author_id: string | null;
  category_id: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  author?: {
    id: string;
    full_name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
  is_liked?: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  status?: 'draft' | 'published' | 'archived';
  author?: string;
}

// Fetch all blog posts with filters
export const useBlogPosts = (filters: BlogFilters = {}) => {
  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: async (): Promise<BlogPost[]> => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:profiles!blog_posts_author_id_fkey(id, full_name, email),
          category:blog_categories!blog_posts_category_id_fkey(id, name, slug, color),
          tags:blog_post_tags(
            tag:blog_tags(id, name, slug, color)
          )
        `)
        .order('published_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        // Default to published posts for public view
        query = query.eq('status', 'published');
      }

      if (filters.category) {
        query = query.eq('category.slug', filters.category);
      }

      if (filters.author) {
        query = query.eq('author_id', filters.author);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform tags data
      return data?.map(post => ({
        ...post,
        tags: post.tags?.map((t: any) => t.tag).filter(Boolean) || []
      })) || [];
    },
  });
};

// Fetch single blog post by slug
export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async (): Promise<BlogPost | null> => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:profiles!blog_posts_author_id_fkey(id, full_name, email),
          category:blog_categories!blog_posts_category_id_fkey(id, name, slug, color),
          tags:blog_post_tags(
            tag:blog_tags(id, name, slug, color)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        ...data,
        tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || []
      };
    },
    enabled: !!slug,
  });
};

// Fetch blog categories
export const useBlogCategories = () => {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async (): Promise<BlogCategory[]> => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch blog tags
export const useBlogTags = () => {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async (): Promise<BlogTag[]> => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};

// Toggle like on blog post
export const useToggleBlogPostLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase.rpc('toggle_blog_post_like', {
        post_id: postId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, postId) => {
      // Update the specific post in cache
      queryClient.setQueryData(['blog-post', postId], (old: BlogPost | null) => {
        if (!old) return old;
        return {
          ...old,
          like_count: data.like_count,
          is_liked: data.liked
        };
      });

      // Update all blog posts cache
      queryClient.setQueryData(['blog-posts'], (old: BlogPost[] | undefined) => {
        if (!old) return old;
        return old.map(post => 
          post.id === postId 
            ? { ...post, like_count: data.like_count, is_liked: data.liked }
            : post
        );
      });
    },
  });
};

// Increment blog post view
export const useIncrementBlogPostView = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.rpc('increment_blog_post_view', {
        post_id: postId
      });

      if (error) throw error;
    },
  });
};

// Create blog post (admin only)
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: {
      title: string;
      slug: string;
      excerpt?: string;
      content: string;
      featured_image_url?: string;
      category_id?: string;
      tag_ids?: string[];
    }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...postData,
          author_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add tags if provided
      if (postData.tag_ids && postData.tag_ids.length > 0) {
        const tagInserts = postData.tag_ids.map(tagId => ({
          post_id: data.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('blog_post_tags')
          .insert(tagInserts);

        if (tagError) throw tagError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
};

// Update blog post (admin only)
export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...postData }: {
      id: string;
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      featured_image_url?: string;
      status?: 'draft' | 'published' | 'archived';
      category_id?: string;
      tag_ids?: string[];
    }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update tags if provided
      if (postData.tag_ids !== undefined) {
        // Remove existing tags
        await supabase
          .from('blog_post_tags')
          .delete()
          .eq('post_id', id);

        // Add new tags
        if (postData.tag_ids.length > 0) {
          const tagInserts = postData.tag_ids.map(tagId => ({
            post_id: id,
            tag_id: tagId
          }));

          const { error: tagError } = await supabase
            .from('blog_post_tags')
            .insert(tagInserts);

          if (tagError) throw tagError;
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', data.slug] });
    },
  });
};

// Delete blog post (admin only)
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
};