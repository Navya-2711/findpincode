import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Building2, Navigation, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { searchPincodes } from '../lib/api';
import type { Pincode } from '../lib/supabase';

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [results, setResults] = useState<Pincode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    searchPincodes(query)
      .then((r) => setResults(r))
      .catch((e) => setError(e.message || 'Failed to fetch results'))
      .finally(() => setLoading(false));
  }, [query]);

  const isPincode = /^\d+$/.test(query);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      {/* Search header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <SearchBar initialQuery={query} size="md" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {query ? (
            <>Search results for <span className="text-blue-600">"{query}"</span></>
          ) : (
            'Start searching'
          )}
        </h1>
        <p className="mt-1 text-gray-600">
          {loading ? 'Searching...' : !query ? 'Enter a pincode or area name above.' : `${results.length} result${results.length === 1 ? '' : 's'} found`}
        </p>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mt-12 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm">Fetching pincode details...</p>
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              We couldn't find any pincode matching "{query}". Try a different search term.
            </p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            {/* SEO info block */}
            {isPincode && (
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pincode {query} - {results[0].district_name}, {results[0].state_name}
                </h2>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                  Pincode <strong>{query}</strong> belongs to {results[0].state_name} state,
                  {' '}{results[0].district_name} district. There {results.length === 1 ? 'is 1 post office' : `are ${results.length} post offices`}
                  {' '}serving this pincode. The head office is{' '}
                  {results.find((r) => r.office_type === 'H.O')?.office_name || results[0].office_name}.
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {results.map((r) => (
                <Link
                  key={r.id}
                  to={`/pincode/${r.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">
                          {r.pincode}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{r.office_name}</h3>
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                          r.office_type === 'H.O' ? 'bg-amber-100 text-amber-700' :
                          r.office_type === 'S.O' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {r.office_type}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-gray-400" /> {r.district_name}, {r.state_name}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> Taluk: {r.taluk || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><Navigation className="h-4 w-4 text-gray-400" /> Division: {r.division || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {r.delivery}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
