import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, Mail, Search as SearchIcon, ArrowRight, TrendingUp } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { getAllStates } from '../lib/api';

const popularPincodes = [
  { pincode: '110001', area: 'New Delhi', state: 'Delhi' },
  { pincode: '400001', area: 'Mumbai GPO', state: 'Maharashtra' },
  { pincode: '560001', area: 'Bangalore', state: 'Karnataka' },
  { pincode: '700001', area: 'Kolkata', state: 'West Bengal' },
  { pincode: '600001', area: 'Chennai', state: 'Tamil Nadu' },
  { pincode: '500001', area: 'Hyderabad', state: 'Telangana' },
  { pincode: '380001', area: 'Ahmedabad', state: 'Gujarat' },
  { pincode: '411001', area: 'Pune', state: 'Maharashtra' },
];

export default function Home() {
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllStates()
      .then(setStates)
      .catch(() => setStates([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium ring-1 ring-white/20">
              <MapPin className="h-4 w-4" /> India's Largest Pincode Directory
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Find Any Pincode in India
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-blue-100 leading-relaxed">
              Search by pincode number, post office name, district, or state.
              Get complete post office details instantly.
            </p>
            <div className="mt-10 max-w-2xl mx-auto">
              <SearchBar autoFocus />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {popularPincodes.map((p) => (
                <Link
                  key={p.pincode}
                  to={`/search?q=${p.pincode}`}
                  className="rounded-full bg-white/10 px-3 py-1 text-sm text-blue-50 hover:bg-white/20 transition-colors ring-1 ring-white/10"
                >
                  {p.pincode}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Stats */}
      <section className="bg-white -mt-8 relative z-10 max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-gray-100 bg-white shadow-lg p-6">
          {[
            { icon: MapPin, label: 'Pincodes', value: '1,54,000+' },
            { icon: Building2, label: 'Post Offices', value: '1,54,965' },
            { icon: Mail, label: 'States & UTs', value: '28 + 8' },
            { icon: TrendingUp, label: 'Daily Searches', value: '50,000+' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="mx-auto h-7 w-7 text-blue-600" />
              <p className="mt-2 text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by state */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse by State</h2>
            <p className="mt-2 text-gray-600">Find pincodes by selecting your state</p>
          </div>
          <Link to="/states" className="hidden sm:inline-flex items-center gap-1 text-blue-600 font-medium hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {states.slice(0, 18).map((state) => (
              <Link
                key={state}
                to={`/state/${encodeURIComponent(state.toLowerCase().replace(/\s+/g, '-'))}`}
                className="group flex flex-col items-start gap-1 rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <MapPin className="h-5 w-5 text-blue-500 group-hover:text-blue-600" />
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">{state}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link to="/states" className="inline-flex items-center gap-1 text-blue-600 font-medium">
            View all states <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Popular searches */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Popular Pincode Searches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularPincodes.map((p) => (
              <Link
                key={p.pincode}
                to={`/search?q=${p.pincode}`}
                className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div>
                  <p className="text-lg font-bold text-gray-900">{p.pincode}</p>
                  <p className="text-sm text-gray-500">{p.area}, {p.state}</p>
                </div>
                <SearchIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
