import { useEffect, useState, type FormEvent } from 'react';
import { supabase, type Pincode, type BlogPost, type ContactMessage } from '../lib/supabase';
import { slugify } from '../lib/api';
import { Plus, Pencil, Trash2, X, Search, Loader2, MapPin, FileText, Mail, LogOut, CheckCircle2 } from 'lucide-react';

type Tab = 'pincodes' | 'blog' | 'messages';

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('pincodes');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage pincode data, blog posts, and messages</p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 -mb-px">
            {([
              { id: 'pincodes', label: 'Pincodes', icon: MapPin },
              { id: 'blog', label: 'Blog Posts', icon: FileText },
              { id: 'messages', label: 'Messages', icon: Mail },
            ] as { id: Tab; label: string; icon: typeof MapPin }[]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'pincodes' && <PincodesManager />}
        {tab === 'blog' && <BlogManager />}
        {tab === 'messages' && <MessagesManager />}
      </div>
    </div>
  );
}

/* ---------- PINCODES ---------- */

const emptyPincode: Omit<Pincode, 'id' | 'created_at' | 'updated_at'> = {
  pincode: '', office_name: '', office_type: 'B.O', delivery: 'Delivery',
  division: '', region: '', circle: '', taluk: '', district_name: '', state_name: '',
  telephone: '', related_suboffice: '', related_headoffice: '', longitude: null, latitude: null,
};

function PincodesManager() {
  const [items, setItems] = useState<Pincode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Pincode | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<typeof emptyPincode>(emptyPincode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    let q = supabase.from('pincodes').select('*').order('created_at', { ascending: false }).limit(200);
    if (search.trim()) {
      q = supabase.from('pincodes').select('*').or(`pincode.ilike.%${search}%,office_name.ilike.%${search}%,state_name.ilike.%${search}%`).order('created_at', { ascending: false }).limit(200);
    }
    const { data, error } = await q;
    if (error) setError(error.message);
    else setItems(data as Pincode[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p: Pincode) => {
    setEditing(p);
    setCreating(false);
    setForm({ ...p });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ ...emptyPincode });
  };

  const cancel = () => { setEditing(null); setCreating(false); setForm({ ...emptyPincode }); };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const { error } = await supabase.from('pincodes').update(form).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pincodes').insert(form);
        if (error) throw error;
      }
      cancel();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this pincode record?')) return;
    const { error } = await supabase.from('pincodes').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    await load();
  };

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search pincodes..."
            className={`${inputCls} pl-9`}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Refresh</button>
          <button onClick={startCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add Pincode
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {(editing || creating) && (
        <form onSubmit={save} className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Pincode' : 'New Pincode'}</h3>
            <button type="button" onClick={cancel} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              ['pincode', 'Pincode *'], ['office_name', 'Office Name *'], ['office_type', 'Office Type'],
              ['delivery', 'Delivery'], ['division', 'Division'], ['region', 'Region'],
              ['circle', 'Circle'], ['taluk', 'Taluk'], ['district_name', 'District *'],
              ['state_name', 'State *'], ['telephone', 'Telephone'], ['related_suboffice', 'Related Sub Office'],
              ['related_headoffice', 'Related Head Office'],
            ] as [keyof typeof form, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  value={(form[key] as string) || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={inputCls}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
              <input
                type="number" step="any"
                value={form.latitude ?? ''}
                onChange={(e) => setForm({ ...form, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
              <input
                type="number" step="any"
                value={form.longitude ?? ''}
                onChange={(e) => setForm({ ...form, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={cancel} className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Pincode</th>
                <th className="px-4 py-3">Office</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-blue-700">{p.pincode}</td>
                  <td className="px-4 py-3 text-gray-900">{p.office_name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.district_name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.state_name}</td>
                  <td className="px-4 py-3"><span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{p.office_type}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(p)} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mr-3">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(p.id)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No pincodes found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- BLOG ---------- */

const emptyPost = { title: '', slug: '', excerpt: '', content: '', author: 'Admin', published: true };

function BlogManager() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<typeof emptyPost>(emptyPost);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setItems(data as BlogPost[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p: BlogPost) => { setEditing(p); setCreating(false); setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || '', content: p.content || '', author: p.author, published: p.published }); };
  const startCreate = () => { setCreating(true); setEditing(null); setForm({ ...emptyPost }); };
  const cancel = () => { setEditing(null); setCreating(false); setForm({ ...emptyPost }); };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, slug: form.slug || slugify(form.title) };
    try {
      if (editing) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) throw error;
      }
      cancel();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    await load();
  };

  const togglePublish = async (p: BlogPost) => {
    const { error } = await supabase.from('blog_posts').update({ published: !p.published }).eq('id', p.id);
    if (error) { setError(error.message); return; }
    await load();
  };

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{items.length} Blog Posts</h2>
        <button onClick={startCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {(editing || creating) && (
        <form onSubmit={save} className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Post' : 'New Post'}</h3>
            <button type="button" onClick={cancel} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Author</label>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Excerpt</label>
              <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Content (Markdown-style)</label>
              <textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={`${inputCls} font-mono`} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" />
              Published
            </label>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Post'}
            </button>
            <button type="button" onClick={cancel} className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                  <td className="px-4 py-3 text-gray-600">{p.author}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(p)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {p.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(p)} className="text-blue-600 hover:text-blue-700 mr-3"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(p.id)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No blog posts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- MESSAGES ---------- */

function MessagesManager() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setItems(data as ContactMessage[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    await load();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">{items.length} Contact Messages</h2>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{m.name}</h3>
                    <span className="text-sm text-blue-600">{m.email}</span>
                    <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString('en-IN')}</span>
                  </div>
                  {m.subject && <p className="mt-1 text-sm font-medium text-gray-700">Subject: {m.subject}</p>}
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{m.message}</p>
                </div>
                <button onClick={() => remove(m.id)} className="text-red-600 hover:text-red-700 shrink-0"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-gray-500 py-12">No messages yet.</p>}
        </div>
      )}
    </div>
  );
}
