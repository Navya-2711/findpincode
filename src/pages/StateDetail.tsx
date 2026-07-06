import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Building2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { getPincodesByState, getDistrictsByState } from '../lib/api';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stateName) return;
    setLoading(true);
    Promise.all([getPincodesByState(stateName), getDistrictsByState(stateName)])
      .then(([p, d]) => {
        setPincodes(p);
        setDistricts(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [stateName]);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/states" className="inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white mb-3">
            <ArrowLeft className="h-4 w-4" /> All States
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">{stateName}</h1>
          <p className="mt-2 text-blue-100">
            {loading ? 'Loading...' : `${pincodes.length} post offices across ${districts.length} districts`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading && (
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm">Loading pincodes for {stateName}...</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Districts sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Districts</h2>
                <ul className="mt-3 space-y-1 max-h-96 lg:overflow-y-auto">
                  {districts.map((d) => {
                    const count = pincodes.filter((p) => p.district_name === d).length;
                    return (
                      <li key={d}>
                        <a
                          href={`#district-${encodeURIComponent(d)}`}
                          className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <span>{d}</span>
                          <span className="text-xs text-gray-400">{count}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>

            {/* Pincodes list grouped by district */}
            <div className="lg:col-span-3 space-y-8">
              {districts.map((d) => {
                const items = pincodes.filter((p) => p.district_name === d);
                if (items.length === 0) return null;
                return (
                  <section key={d} id={`district-${encodeURIComponent(d)}`} className="scroll-mt-20">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-900">{d}</h2>
                      <span className="text-sm text-gray-500">({items.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {items.map((p) => (
                        <Link
                          key={p.id}
                          to={`/pincode/${p.id}`}
                          className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <span className="inline-flex items-center justify-center rounded-md bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700 shrink-0">
                            {p.pincode}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 truncate">{p.office_name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {p.taluk || p.district_name}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
