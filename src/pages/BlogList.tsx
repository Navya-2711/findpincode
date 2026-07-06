import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Loader2, PenLine } from 'lucide-react';
import { getPublishedPosts } from '../lib/api';
import type { BlogPost } from '../lib/supabase';

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublishedPosts()
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold">Pincode Blog</h1>
          <p className="mt-2 text-blue-100">Articles and guides about the Indian postal system</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm">Loading articles...</p>
          </div>
        )}

        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <PenLine className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No articles yet</h3>
            <p className="mt-1 text-gray-500">Check back soon for new blog posts.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all"
            >
              <div className="aspect-[16/9] bg-gradient-to-br from-blue-100 to-blue-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-black text-blue-300/60 group-hover:scale-110 transition-transform">
                    {post.title.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{post.title}</h2>
                {post.excerpt && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>}
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {post.author}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
