import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, MapPin, Search, ArrowLeft, AlertCircle, Loader2, ChevronRight, Filter, ListChecks } from 'lucide-react';
import { getPincodesByDistrict, getDistrictsByState } from '../lib/api';
import type { Pincode } from '../lib/supabase';

function decodeParam(value: string | undefined) {
  if (!value) return '';
  return decodeURIComponent(value).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DistrictDetail() {
  const { state, district } = useParams<{ state: string; district: string }>();
  const stateName = decodeParam(state);
  const districtName = decodeParam(district);
  const [records, setRecords] = useState<Pincode[]>([]);
  const [relatedDistricts, setRelatedDistricts] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterOfficeType, setFilterOfficeType] = useState('All');
  const [filterDelivery, setFilterDelivery] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stateName || !districtName) return;
    setLoading(true);
    setError(null);

    Promise.all([getPincodesByDistrict(stateName, districtName), getDistrictsByState(stateName)])
      .then(([districtRecords, districtList]) => {
        setRecords(districtRecords);
        setRelatedDistricts(districtList.filter((d) => d !== districtName).slice(0, 5));
      })
      .catch((e) => setError(e.message || 'Unable to load district information'))
      .finally(() => setLoading(false));
  }, [stateName, districtName]);

  const matchingRecords = useMemo(() => {
    return records.filter((record) => {
      const query = search.trim().toLowerCase();
      if (query) {
        const haystack = `${record.pincode} ${record.office_name} ${record.office_type} ${record.delivery} ${record.taluk}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (filterOfficeType !== 'All' && record.office_type !== filterOfficeType) return false;
      if (filterDelivery !== 'All' && record.delivery !== filterDelivery) return false;
      return true;
    });
  }, [records, search, filterOfficeType, filterDelivery]);

  const officeTypes = useMemo(() => Array.from(new Set(records.map((item) => item.office_type))).sort(), [records]);
  const deliveryStatuses = useMemo(() => Array.from(new Set(records.map((item) => item.delivery))).sort(), [records]);
  const totalPincodes = useMemo(() => new Set(records.map((item) => item.pincode)).size, [records]);
  const totalOffices = records.length;

  const districtFaq = [
    { question: 'How do I find a post office in this district?', answer: 'Use the search and filters above to narrow down by office name, pincode, type, or delivery status.' },
    { question: 'Can I view details for a post office?', answer: 'Yes, click any post office card to open the dedicated details page.' },
    { question: 'How are related districts chosen?', answer: 'We show nearby districts from the same state to help you explore regional postal coverage.' },
  ];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to={`/state/${encodeURIComponent(state || '')}`} className="inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white mb-3">
            <ArrowLeft className="h-4 w-4" /> Back to {stateName}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">{districtName}</h1>
          <p className="mt-2 text-blue-100">District postal coverage for {districtName}, {stateName}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/10 p-5 text-sm leading-6">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Total PIN codes</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalPincodes}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 text-sm leading-6">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Total post offices</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalOffices}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5 text-sm leading-6">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Popular office type</p>
              <p className="mt-3 text-3xl font-semibold text-white">{officeTypes[0] ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm">Loading district information...</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <main className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Search within {districtName}</h2>
                    <p className="mt-2 text-sm text-slate-600">Find post offices by PIN code, name, type, or delivery status.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700 inline-flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filters
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Search</span>
                    <div className="mt-2 relative rounded-2xl border border-slate-200 bg-white">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search post offices"
                        className="w-full rounded-2xl border-0 bg-transparent py-3 pl-11 pr-4 text-sm text-slate-900 focus:outline-none"
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Office type</span>
                    <select
                      value={filterOfficeType}
                      onChange={(e) => setFilterOfficeType(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option>All</option>
                      {officeTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Delivery status</span>
                    <select
                      value={filterDelivery}
                      onChange={(e) => setFilterDelivery(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option>All</option>
                      {deliveryStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Post Offices in {districtName}</h2>
                    <p className="mt-2 text-sm text-slate-600">{matchingRecords.length} matching results across {totalPincodes} PIN codes.</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                    <ListChecks className="h-4 w-4" /> {matchingRecords.length}
                  </span>
                </div>

                {matchingRecords.length === 0 ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                    No post offices match your search and filters. Try a broader query.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4">
                    {matchingRecords.map((office) => (
                      <Link
                        key={office.id}
                        to={`/pincode/${office.id}`}
                        className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-blue-600">{office.pincode}</p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900 truncate">{office.office_name}</h3>
                            <p className="mt-2 text-sm text-slate-500">{office.office_type} • {office.delivery}</p>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                            <ChevronRight className="h-4 w-4" /> View details
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {office.taluk || office.district_name}</span>
                          <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" /> Division: {office.division || 'N/A'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </main>

            <aside className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">District Statistics</h2>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Total PIN codes</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{totalPincodes}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Total post offices</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{totalOffices}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Top Taluk</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{records.reduce((prev, current) => current.taluk && current.taluk !== 'N/A' ? current : prev, records[0])?.taluk || 'N/A'}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Related Districts</h2>
                <p className="mt-2 text-sm text-slate-600">Explore nearby districts in {stateName}.</p>
                <div className="mt-4 space-y-3">
                  {relatedDistricts.map((districtItem) => (
                    <Link
                      key={districtItem}
                      to={`/state/${encodeURIComponent(state || '')}/district/${encodeURIComponent(districtItem.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 hover:border-blue-300 hover:bg-blue-50"
                    >
                      {districtItem}
                    </Link>
                  ))}
                  {relatedDistricts.length === 0 && <p className="text-sm text-slate-500">No related districts available.</p>}
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">FAQ</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {districtFaq.map((item) => (
                    <div key={item.question} className="rounded-3xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">{item.question}</p>
                      <p className="mt-2">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
