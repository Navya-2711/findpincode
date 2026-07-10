import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, ChevronLeft, ChevronRight, Filter, SortAsc } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { searchPincodes } from '../lib/api';
import { setMetadata, setStructuredData } from '../lib/seo';
import type { Pincode } from '../lib/supabase';

const PAGE_SIZE = 8;

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q')?.trim() ?? '';
  const [results, setResults] = useState<Pincode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOfficeType, setFilterOfficeType] = useState('All');
  const [filterDelivery, setFilterDelivery] = useState('All');
  const [sortBy, setSortBy] = useState<'office' | 'pincode' | 'district' | 'state' | 'officeType'>('office');
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setMetadata({
      title: query ? `Search results for ${query}` : 'Search PIN codes and post offices',
      description: query
        ? `Search results for ${query} across PIN codes, post offices, districts, and states.`
        : 'Search India PIN codes, post offices, districts, and states.',
      url: `/search?q=${encodeURIComponent(query)}`,
      type: 'website',
    });
    setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: results.slice(0, 10).map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'PostalAddress',
            name: item.office_name,
            postalCode: item.pincode,
            addressLocality: item.district_name,
            addressRegion: item.state_name,
          },
        })),
      },
    });

    setFilterOfficeType('All');
    setFilterDelivery('All');
    setSortBy('office');
    setPageIndex(0);

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

  const officeTypes = useMemo(
    () => Array.from(new Set(results.map((r) => r.office_type).filter(Boolean))).sort(),
    [results],
  );

  const deliveryStatuses = useMemo(
    () => Array.from(new Set(results.map((r) => r.delivery).filter(Boolean))).sort(),
    [results],
  );

  const filteredResults = useMemo(() => {
    const filtered = results.filter((r) => {
      if (filterOfficeType !== 'All' && r.office_type !== filterOfficeType) return false;
      if (filterDelivery !== 'All' && r.delivery !== filterDelivery) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'pincode':
          return a.pincode.localeCompare(b.pincode);
        case 'district':
          return a.district_name.localeCompare(b.district_name);
        case 'state':
          return a.state_name.localeCompare(b.state_name);
        case 'officeType':
          return a.office_type.localeCompare(b.office_type);
        default:
          return a.office_name.localeCompare(b.office_name);
      }
    });
  }, [results, filterOfficeType, filterDelivery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));

  useEffect(() => {
    if (pageIndex >= totalPages) {
      setPageIndex(0);
    }
  }, [pageIndex, totalPages]);

  const pageResults = filteredResults.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE);
  const isPincode = /^\d+$/.test(query);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="hover:text-blue-600">Search</span>
            {query && (
              <>
                <span>/</span>
                <span className="font-medium text-slate-900">{query}</span>
              </>
            )}
          </nav>

          <SearchBar initialQuery={query} size="md" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {query ? (
                <>Search results for <span className="text-blue-600">"{query}"</span></>
              ) : (
                'Start searching'
              )}
            </h1>
            <p className="mt-1 text-gray-600">
              {loading
                ? 'Searching...'
                : !query
                  ? 'Enter a PIN Code, post office, area, district, city, or state above.'
                  : `${filteredResults.length} result${filteredResults.length === 1 ? '' : 's'} found ${results.length !== filteredResults.length ? `(filtered from ${results.length})` : ''}`}
            </p>
          </div>

          {query && !loading && results.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                <Filter className="h-4 w-4" /> Filters
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                <SortAsc className="h-4 w-4" /> Sorted by {sortBy === 'office' ? 'Office name' : sortBy === 'pincode' ? 'PIN code' : sortBy === 'district' ? 'District' : sortBy === 'state' ? 'State' : 'Office type'}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && query && results.length > 0 && (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700">
                  Office type
                  <select
                    value={filterOfficeType}
                    onChange={(e) => { setFilterOfficeType(e.target.value); setPageIndex(0); }}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option>All</option>
                    {officeTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Delivery status
                  <select
                    value={filterDelivery}
                    onChange={(e) => { setFilterDelivery(e.target.value); setPageIndex(0); }}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option>All</option>
                    {deliveryStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Sort by
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="office">Office name</option>
                    <option value="pincode">PIN code</option>
                    <option value="district">District</option>
                    <option value="state">State</option>
                    <option value="officeType">Office type</option>
                  </select>
                </label>
              </div>

              {filteredResults.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
                  <p className="text-sm font-semibold text-slate-900">No results match your filters.</p>
                  <p className="mt-2 text-sm text-slate-600">Clear filters to see all related post offices again.</p>
                </div>
              ) : (
                <div className="rounded-3xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
                  <div className="grid gap-4 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 p-5">
                        <p className="text-sm font-semibold text-slate-500">Matching post offices</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{filteredResults.length}</p>
                        <p className="mt-1 text-sm text-slate-500">Showing the best matches for your search and filters.</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 p-5">
                        <p className="text-sm font-semibold text-slate-500">Search type</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{isPincode ? 'Pincode lookup' : 'Area search'}</p>
                        <p className="mt-1 text-sm text-slate-500">Use filters and sort options to narrow results.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Search overview</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <p>Query: <span className="font-medium text-slate-900">{query}</span></p>
                <p>Office types: <span className="font-medium text-slate-900">{officeTypes.length || '—'}</span></p>
                <p>Delivery statuses: <span className="font-medium text-slate-900">{deliveryStatuses.length || '—'}</span></p>
                <p>Results per page: <span className="font-medium text-slate-900">{PAGE_SIZE}</span></p>
              </div>
            </div>
          </div>
        )}

        {loading && !error && (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6">
                <div className="h-5 w-1/2 rounded-full bg-slate-200" />
                <div className="mt-4 h-4 w-24 rounded-full bg-slate-200" />
                <div className="mt-4 grid gap-2">
                  <div className="h-3 w-full rounded-full bg-slate-200" />
                  <div className="h-3 w-full rounded-full bg-slate-200" />
                  <div className="h-3 w-1/2 rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && query && filteredResults.length > 0 && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {pageResults.map((r) => (
              <article key={r.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">{r.pincode}</span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${r.office_type === 'H.O' ? 'bg-amber-100 text-amber-700' : r.office_type === 'S.O' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{r.office_type}</span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${r.delivery === 'Delivery' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>{r.delivery}</span>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-slate-900">{r.office_name}</h2>
                    <p className="mt-2 text-sm text-slate-600">{r.district_name}, {r.state_name}</p>
                  </div>

                  <Link
                    to={`/pincode/${r.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-medium text-slate-900">District</p>
                    <p className="mt-1">{r.district_name}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-medium text-slate-900">Division</p>
                    <p className="mt-1">{r.division || 'N/A'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-medium text-slate-900">Region</p>
                    <p className="mt-1">{r.region || 'N/A'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="font-medium text-slate-900">Circle</p>
                    <p className="mt-1">{r.circle || 'N/A'}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && filteredResults.length > PAGE_SIZE && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">Showing {pageResults.length} of {filteredResults.length} matching post offices.</p>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                disabled={pageIndex === 0}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-slate-700">{pageIndex + 1} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={pageIndex >= totalPages - 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
