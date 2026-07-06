import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, User, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { getPostBySlug } from '../lib/api';
import type { BlogPost } from '../lib/supabase';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPostBySlug(slug)
      .then(setPost)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <p className="mt-4 text-gray-600">{error}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Article not found</h2>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-1 text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  const paragraphs = (post.content || '').split('\n').filter(Boolean);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <div className="rounded-2xl bg-white border border-gray-200 p-8 sm:p-10 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {post.excerpt && (
            <p className="mt-6 text-lg text-gray-600 leading-relaxed border-l-4 border-blue-500 pl-4 italic">
              {post.excerpt}
            </p>
          )}

          <div className="mt-8 prose prose-gray max-w-none">
            {paragraphs.map((p, i) => {
              if (p.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-3">{p.replace('## ', '')}</h2>;
              }
              if (p.startsWith('- ')) {
                return <li key={i} className="ml-6 text-gray-700 leading-relaxed list-disc">{p.replace('- ', '')}</li>;
              }
              if (p.startsWith('1. ') || /^\d+\.\s/.test(p)) {
                return <li key={i} className="ml-6 text-gray-700 leading-relaxed list-decimal">{p.replace(/^\d+\.\s/, '')}</li>;
              }
              return <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>;
            })}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/blog" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
        </div>
      </article>
    </div>
  );
}
