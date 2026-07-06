import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Loader2, ArrowRight } from 'lucide-react';
import { getAllStates } from '../lib/api';

export default function StatesList() {
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getAllStates()
      .then(setStates)
      .catch(() => setStates([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = states.filter((s) => s.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold">Search by State</h1>
          <p className="mt-2 text-blue-100">Browse pincodes across all Indian states and union territories</p>
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
            <p className="mt-3 text-sm">Loading states...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} states & UTs available</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((state) => (
                <Link
                  key={state}
                  to={`/state/${encodeURIComponent(state.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span className="font-medium text-gray-900 group-hover:text-blue-700">{state}</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            {!loading && filtered.length === 0 && (
              <p className="text-center text-gray-500 py-12">No states match "{filter}"</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
