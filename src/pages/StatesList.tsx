import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Loader2, ArrowRight } from 'lucide-react';
import { getStateSummaries, type StateSummary } from '../lib/api';

export default function StatesList() {
  const [states, setStates] = useState<StateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getStateSummaries()
      .then(setStates)
      .catch(() => setStates([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => states.filter((entry) => entry.state_name.toLowerCase().includes(filter.toLowerCase())),
    [filter, states],
  );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold">All States & Union Territories</h1>
          <p className="mt-2 text-blue-100">Explore postal coverage by state with total PIN codes, post offices, districts, and popular cities.</p>
          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter states..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border-0 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm">Loading state summaries...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} states & UTs available</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((state) => (
                <Link
                  key={state.state_name}
                  to={`/state/${encodeURIComponent(state.state_name.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="group block rounded-3xl border border-gray-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <MapPin className="h-5 w-5" />
                        </span>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700">{state.state_name}</h2>
                          <p className="mt-1 text-sm text-slate-500">{state.district_count} districts</p>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:text-blue-600" />
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">PIN codes</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{state.pincode_count}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Post offices</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{state.post_office_count}</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-medium text-slate-700">Popular cities</p>
                    <div className="flex flex-wrap gap-2">
                      {state.popular_cities.slice(0, 4).map((city) => (
                        <span key={city} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{city}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-gray-500 py-12">No states match "{filter}"</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
