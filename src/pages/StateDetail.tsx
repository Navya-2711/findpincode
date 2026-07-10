import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Globe, Sparkles, Hash, ListChecks } from 'lucide-react';
import { getPincodesByState, getDistrictsByState, getStateSummary, type StateSummary } from '../lib/api';
import type { Pincode } from '../lib/supabase';

function decodeStateParam(s: string): string {
  const decoded = decodeURIComponent(s);
  return decoded.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StateDetail() {
  const { state } = useParams<{ state: string }>();
  const stateName = state ? decodeStateParam(state) : '';
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [summary, setSummary] = useState<StateSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stateName) return;
    setLoading(true);
    setError(null);

    Promise.all([getPincodesByState(stateName), getDistrictsByState(stateName), getStateSummary(stateName)])
      .then(([p, d, s]) => {
        setPincodes(p);
        setDistricts(d);
        setSummary(s);
      })
      .catch((e) => setError(e.message || 'Unable to load state details'))
      .finally(() => setLoading(false));
  }, [stateName]);

  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    pincodes.forEach((item) => {
      counts[item.district_name] = (counts[item.district_name] || 0) + 1;
    });
    return counts;
  }, [pincodes]);

  const topDistricts = useMemo(
    () => Object.entries(districtCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([district]) => district),
    [districtCounts],
  );

  const faqs = [
    { question: 'How many districts are covered in this state?', answer: 'The districts section below lists all districts with postal coverage and a direct link to each group.' },
    { question: 'Where can I find popular cities?', answer: 'Popular cities are shown in the summary cards to highlight the busiest postal areas.' },
    { question: 'Can I search within this state?', answer: 'Use the section links or browser search to quickly jump to a district or summary card.' },
  ];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/states" className="inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white mb-3">
            <ArrowLeft className="h-4 w-4" /> All States
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">{stateName}</h1>
          <p className="mt-2 text-blue-100">Postal overviews, districts, popular cities, and PIN code coverage for {stateName}.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-blue-100">Post offices</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary?.post_office_count ?? pincodes.length}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-blue-100">PIN codes</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary?.pincode_count ?? new Set(pincodes.map((item) => item.pincode)).size}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-blue-100">Districts</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary?.district_count ?? districts.length}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-blue-100">Top city</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary?.popular_cities[0] ?? topDistricts[0] ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm">Loading state details...</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-[0.24em]">Navigation</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {['overview', 'districts', 'popular-cities', 'faq'].map((section) => (
                    <a key={section} href={`#${section}`} className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-blue-300 hover:bg-blue-50">
                      {section === 'overview' ? 'Overview' : section === 'districts' ? 'Districts' : section === 'popular-cities' ? 'Popular cities' : 'FAQ'}
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-[0.24em]">Quick facts</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">Most active district</p>
                    <p className="mt-2">{topDistricts[0] ?? 'N/A'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">Popular cities</p>
                    <p className="mt-2">{summary?.popular_cities.slice(0, 3).join(', ') || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </aside>

            <main className="space-y-8">
              <section id="overview" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-slate-900">State overview</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {stateName} has {summary?.post_office_count ?? pincodes.length} post offices across {summary?.district_count ?? districts.length} districts and {summary?.pincode_count ?? new Set(pincodes.map((item) => item.pincode)).size} unique PIN codes. Popular postal hubs include {summary?.popular_cities.slice(0, 3).join(', ') || topDistricts.slice(0, 3).join(', ')}.
                </p>
              </section>

              <section id="districts" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center gap-3">
                  <ListChecks className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-slate-900">Districts</h2>
                </div>
                <p className="mt-4 text-sm text-slate-600">Browse all districts in {stateName} and open district pages for local postal coverage.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {districts.map((districtNameItem) => (
                    <Link
                      key={districtNameItem}
                      to={`/state/${encodeURIComponent(state || '')}/district/${encodeURIComponent(districtNameItem.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700">{districtNameItem}</h3>
                          <p className="mt-2 text-sm text-slate-500">{districtCounts[districtNameItem] ?? 0} post offices</p>
                        </div>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600">
                          <Hash className="h-5 w-5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section id="popular-cities" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-slate-900">Popular cities</h2>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(summary?.popular_cities.length ? summary.popular_cities : topDistricts).map((city) => (
                    <span key={city} className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">{city}</span>
                  ))}
                </div>
              </section>

              <section id="faq" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-slate-900">Frequently asked questions</h2>
                </div>
                <div className="mt-5 space-y-4">
                  {faqs.map((item) => (
                    <div key={item.question} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">{item.question}</p>
                      <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
