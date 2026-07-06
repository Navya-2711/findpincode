import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Building2, ArrowLeft, AlertCircle, Loader2, Globe } from 'lucide-react';
import { getPincodeById, getPincodesByPincode } from '../lib/api';
import type { Pincode } from '../lib/supabase';

export default function PincodeDetail() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<Pincode | null>(null);
  const [related, setRelated] = useState<Pincode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPincodeById(id)
      .then(async (r) => {
        if (!r) {
          setRecord(null);
          return;
        }
        setRecord(r);
        const rel = await getPincodesByPincode(r.pincode);
        setRelated(rel.filter((p) => p.id !== r.id));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-3 text-sm">Loading post office details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Something went wrong</h2>
        <p className="mt-1 text-gray-600">{error}</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Post office not found</h2>
        <p className="mt-1 text-gray-600">The record you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-1 text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const fields = [
    { label: 'Pincode', value: record.pincode },
    { label: 'Post Office Name', value: record.office_name },
    { label: 'Office Type', value: record.office_type },
    { label: 'Delivery Status', value: record.delivery },
    { label: 'Division Name', value: record.division },
    { label: 'Region Name', value: record.region },
    { label: 'Circle Name', value: record.circle },
    { label: 'Taluk', value: record.taluk },
    { label: 'District', value: record.district_name },
    { label: 'State', value: record.state_name },
    { label: 'Telephone', value: record.telephone },
    { label: 'Related Sub Office', value: record.related_suboffice },
    { label: 'Related Head Office', value: record.related_headoffice },
  ];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to={`/state/${encodeURIComponent(record.state_name.toLowerCase().replace(/\s+/g, '-'))}`} className="hover:text-blue-600">{record.state_name}</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{record.pincode}</span>
        </nav>

        <Link to={`/search?q=${record.pincode}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to search results
        </Link>

        {/* Header card */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-lg bg-white/15 px-3 py-1 text-sm font-medium ring-1 ring-white/20">{record.office_type}</span>
            <span className="inline-flex items-center rounded-lg bg-white/15 px-3 py-1 text-sm font-medium ring-1 ring-white/20">{record.delivery}</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold">{record.office_name}</h1>
          <p className="mt-2 text-blue-100 text-lg">Pincode: <strong className="text-white">{record.pincode}</strong></p>
          <p className="mt-1 text-blue-100">{record.district_name}, {record.state_name}</p>
        </div>

        {/* Details table */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <h2 className="px-6 py-4 text-lg font-semibold text-gray-900 border-b border-gray-100 bg-gray-50">
            Post Office Details
          </h2>
          <dl className="divide-y divide-gray-100">
            {fields.map((f) => (
              <div key={f.label} className="px-6 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">{f.label}</dt>
                <dd className="sm:col-span-2 text-sm text-gray-900">{f.value || 'N/A'}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Location */}
        {(record.latitude && record.longitude) && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Globe className="h-5 w-5 text-blue-600" /> Location
            </h2>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> Latitude: {record.latitude}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> Longitude: {record.longitude}</span>
            </div>
          </div>
        )}

        {/* Related post offices */}
        {related.length > 0 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Other Post Offices with Pincode {record.pincode}
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/pincode/${r.id}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:bg-blue-50/40 transition-all"
                >
                  <Building2 className="h-5 w-5 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.office_name}</p>
                    <p className="text-xs text-gray-500">{r.district_name}, {r.state_name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* SEO content */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">About {record.office_name}</h2>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
            <strong>{record.office_name}</strong> is a {record.office_type} post office located in{' '}
            <strong>{record.district_name}</strong> district of <strong>{record.state_name}</strong> state.
            The pincode of this post office is <strong>{record.pincode}</strong>.
            It falls under the {record.division || 'N/A'} division of the {record.region || 'N/A'} region
            in the {record.circle || record.state_name} circle. The delivery status of this post office is{' '}
            <strong>{record.delivery}</strong>. The taluk for this post office is {record.taluk || 'N/A'}.
          </p>
        </div>
      </div>
    </div>
  );
}
