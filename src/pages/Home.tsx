import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock3, Mail, MapPin, TrendingUp } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { getAllStates, getPublishedPosts } from '../lib/api';
import { setMetadata, setStructuredData } from '../lib/seo';
import type { BlogPost } from '../lib/supabase';

const RECENT_SEARCHES_STORAGE_KEY = 'pincode-finder-recent-searches';

const popularSearches = [
  { label: '110001', description: 'New Delhi', type: 'Pincode' },
  { label: 'Connaught Place', description: 'Area / landmark', type: 'Area' },
  { label: 'Mumbai', description: 'City', type: 'City' },
  { label: 'Karnataka', description: 'State', type: 'State' },
  { label: 'Bengaluru Urban', description: 'District', type: 'District' },
  { label: 'Delhi GPO', description: 'Post office', type: 'Post Office' },
];

const popularPincodes = [
  { pincode: '110001', area: 'New Delhi', state: 'Delhi' },
  { pincode: '400001', area: 'Mumbai GPO', state: 'Maharashtra' },
  { pincode: '560001', area: 'Bangalore', state: 'Karnataka' },
  { pincode: '700001', area: 'Kolkata', state: 'West Bengal' },
  { pincode: '600001', area: 'Chennai', state: 'Tamil Nadu' },
  { pincode: '500001', area: 'Hyderabad', state: 'Telangana' },
];

const stateDescriptions: Record<string, string> = {
  Delhi: 'Capital city, business centres, and dense urban delivery zones.',
  Maharashtra: 'Major metro corridors and high-volume postal services.',
  Karnataka: 'Technology hubs and fast-growing suburban regions.',
  'Tamil Nadu': 'Historic districts and modern urban delivery networks.',
  'West Bengal': 'Cultural landmarks and city-wide postal coverage.',
  Telangana: 'Rapidly expanding metros with strong logistics reach.',
  Gujarat: 'Industrial corridors and vibrant commercial districts.',
  Rajasthan: 'Wide regional coverage spanning cities and towns.',
};

export default function Home() {
  const [states, setStates] = useState<string[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMetadata({
      title: 'Find PIN codes and post offices in India',
      description: 'Search India PIN codes, post office details, districts, cities, and states. Access postal coverage and delivery information instantly.',
      url: '/',
      type: 'website',
    });
    setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Pincode Finder',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    let active = true;

    const loadData = async () => {
      try {
        const [stateData, postsData] = await Promise.all([getAllStates(), getPublishedPosts()]);
        if (!active) return;

        setStates(stateData);
        setLatestPosts(postsData.slice(0, 3));
      } catch {
        if (active) {
          setStates([]);
          setLatestPosts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as string[];
          setRecentSearches(parsed.filter(Boolean));
        }
      } catch {
        window.localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
      }
    }

    return () => {
      active = false;
      setStructuredData(null);
    };
  }, []);

  const featuredStates = useMemo(() => states.slice(0, 8), [states]);

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_45%,_#2563eb_100%)] text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium ring-1 ring-white/20">
                <MapPin className="h-4 w-4" /> India’s most trusted pincode directory
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find PIN codes, post offices, districts, cities, and states in seconds.
              </h1>
              <p className="mt-5 text-lg leading-8 text-blue-100 sm:text-xl">
                Search by PIN code, post office name, area, district, city, or state and access trusted postal details instantly.
              </p>

              <div className="mt-8 max-w-2xl">
                <SearchBar autoFocus />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {popularSearches.slice(0, 4).map((item) => (
                  <Link
                    key={item.label}
                    to={`/search?q=${encodeURIComponent(item.label)}`}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-blue-50 transition hover:bg-white/20"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">Quick access</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Popular destinations</h2>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-blue-100">Updated daily</span>
              </div>

              <div className="mt-6 space-y-3">
                {popularPincodes.slice(0, 4).map((item) => (
                  <Link
                    key={item.pincode}
                    to={`/search?q=${item.pincode}`}
                    className="flex items-center justify-between rounded-2xl border border-white/15 bg-slate-950/20 px-4 py-3 transition hover:bg-slate-950/30"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.pincode}</p>
                      <p className="text-sm text-blue-100">{item.area}, {item.state}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-200" />
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/15 bg-slate-950/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock3 className="h-4 w-4" /> Recent searches
                </div>
                {recentSearches.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recentSearches.slice(0, 4).map((item) => (
                      <Link
                        key={item}
                        to={`/search?q=${encodeURIComponent(item)}`}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-blue-50 transition hover:bg-white/20"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-blue-100">Your recent lookups will appear here after you search.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-4">
          {[
            { icon: MapPin, label: 'PIN codes', value: '1,54,000+' },
            { icon: Mail, label: 'Post offices', value: '1,54,965' },
            { icon: ArrowRight, label: 'States & UTs', value: '28 + 8' },
            { icon: TrendingUp, label: 'Daily searches', value: '50,000+' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 p-4 text-center">
              <item.icon className="mx-auto h-7 w-7 text-blue-600" />
              <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Popular searches</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Search suggestions for every need</h2>
              </div>
              <Link to="/search?q=Delhi" className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
                Try a sample
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {popularSearches.map((item) => (
                <Link
                  key={item.label}
                  to={`/search?q=${encodeURIComponent(item.label)}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.type}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Trending PIN codes</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Popular postal lookups</h2>
              </div>
              <Link to="/search?q=400001" className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
                Explore more
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {popularPincodes.map((item) => (
                <Link
                  key={item.pincode}
                  to={`/search?q=${item.pincode}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <p className="text-lg font-bold text-slate-900">{item.pincode}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.area}</p>
                  <p className="text-sm text-slate-500">{item.state}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Browse by state</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Find postal information by state</h2>
          </div>
          <Link to="/states" className="hidden items-center gap-1 text-sm font-medium text-blue-600 transition hover:gap-2 sm:inline-flex">
            View all states <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredStates.map((state) => (
              <Link
                key={state}
                to={`/state/${encodeURIComponent(state.toLowerCase().replace(/\s+/g, '-'))}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">{state}</h3>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">View</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {stateDescriptions[state] || 'Discover pincode details and local postal coverage for this state.'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Latest blogs</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Helpful articles about PIN codes and postal services</h2>
          </div>
          <Link to="/blog" className="hidden items-center gap-1 text-sm font-medium text-blue-600 transition hover:gap-2 sm:inline-flex">
            Read all blogs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latestPosts.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <BookOpen className="h-4 w-4" /> Blog guide
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900 group-hover:text-blue-700">{post.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{post.excerpt || 'Explore postal guidance and tips for finding the right pincode.'}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600">
                  Read more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            Blog content will appear here when new posts are published.
          </div>
        )}
      </section>
    </div>
  );
}
