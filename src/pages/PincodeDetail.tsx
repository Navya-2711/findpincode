import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader2, Copy, Share2, ChevronRight, CheckCircle } from 'lucide-react';
import { getPincodeById, getPincodesByPincode, searchPincodes } from '../lib/api';
import { setMetadata, setStructuredData } from '../lib/seo';
import type { Pincode } from '../lib/supabase';

export default function PincodeDetail() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<Pincode | null>(null);
  const [related, setRelated] = useState<Pincode[]>([]);
  const [relatedPinCodes, setRelatedPinCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setCopyStatus(null);
    setShareStatus(null);

    getPincodeById(id)
      .then(async (r) => {
        if (!r) {
          setRecord(null);
          return;
        }
        setRecord(r);
        const rel = await getPincodesByPincode(r.pincode);
        setRelated(rel.filter((p) => p.id !== r.id));

        const districtMatches = await searchPincodes(r.district_name);
        const uniquePinCodes = Array.from(new Set(districtMatches.map((item) => item.pincode).filter((pin) => pin !== r.pincode))).slice(0, 6);
        setRelatedPinCodes(uniquePinCodes);
      })
      .catch((e) => setError(e.message || 'Failed to load post office details'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!record) {
      setStructuredData(null);
      return;
    }

    setMetadata({
      title: `${record.office_name} | ${record.pincode} Post Office Details`,
      description: `${record.office_name} post office details for ${record.pincode} in ${record.district_name}, ${record.state_name}.`,
      url: `/pincode/${record.id}`,
      type: 'article',
    });

    setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'PostalAddress',
      name: record.office_name,
      streetAddress: record.related_suboffice || record.related_headoffice || record.office_name,
      addressLocality: record.district_name,
      addressRegion: record.state_name,
      postalCode: record.pincode,
      telephone: record.telephone || undefined,
    });
  }, [record]);

  const handleCopyPin = async () => {
    if (!record) return;
    try {
      await navigator.clipboard.writeText(record.pincode);
      setCopyStatus('PIN code copied to clipboard');
      setTimeout(() => setCopyStatus(null), 2500);
    } catch {
      setCopyStatus('Copy failed. Try again.');
    }
  };

  const handleShare = async () => {
    if (!record) return;
    const shareData = {
      title: `${record.office_name} (${record.pincode})`,
      text: `View details for ${record.office_name} post office in ${record.district_name}, ${record.state_name}.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareStatus('Shared successfully');
      } catch {
        setShareStatus('Share cancelled or unavailable');
      }
      setTimeout(() => setShareStatus(null), 2500);
      return;
    }

    await handleCopyPin();
  };

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

  const mapQuery = encodeURIComponent(`${record.office_name}, ${record.district_name}, ${record.state_name}`);
  const fields = [
    { label: 'Office Type', value: record.office_type },
    { label: 'Delivery Status', value: record.delivery },
    { label: 'Division', value: record.division },
    { label: 'Region', value: record.region },
    { label: 'Circle', value: record.circle },
    { label: 'Taluk', value: record.taluk },
    { label: 'District', value: record.district_name },
    { label: 'State', value: record.state_name },
    { label: 'Telephone', value: record.telephone },
    { label: 'Related Sub Office', value: record.related_suboffice },
    { label: 'Related Head Office', value: record.related_headoffice },
  ];

  const faqItems = [
    {
      question: 'How do I copy the PIN code?',
      answer: 'Tap the Copy PIN Code button at the top of the page and paste it anywhere you need.',
    },
    {
      question: 'Can I view the post office on a map?',
      answer: 'Yes, the location section includes a Google Maps preview and an open map link for directions.',
    },
    {
      question: 'What if the post office has multiple branches?',
      answer: 'Related post offices with the same PIN code are listed under Nearby Post Offices.',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to={`/search?q=${encodeURIComponent(record.pincode)}`} className="hover:text-blue-600">Search</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{record.office_name}</span>
        </nav>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-blue-600">Post Office Details</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{record.office_name}</h1>
            <p className="mt-2 text-sm text-slate-600">{record.district_name}, {record.state_name}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopyPin}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" /> Copy PIN Code
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>

        {(copyStatus || shareStatus) && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {copyStatus && <p>{copyStatus}</p>}
            {shareStatus && <p>{shareStatus}</p>}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">PIN Code</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{record.pincode}</p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Office Type</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{record.office_type}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Delivery Status</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{record.delivery}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Full details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">{field.label}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{field.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Location</h2>
                  <p className="mt-1 text-sm text-slate-600">Preview the post office on Google Maps.</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Open map
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                <iframe
                  title="Post office location"
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  className="h-72 w-full"
                  loading="lazy"
                />
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Nearby Post Offices</h2>
              <p className="mt-2 text-sm text-slate-600">Other offices sharing the same PIN code.</p>
              {related.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/pincode/${r.id}`}
                      className="rounded-3xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{r.office_name}</p>
                          <p className="mt-1 text-sm text-slate-600">{r.office_type} • {r.district_name}, {r.state_name}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{r.pincode}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">No other offices found for this PIN code.</p>
              )}
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Related PIN Codes</h2>
              <p className="mt-2 text-sm text-slate-600">Nearby postal regions in the same district.</p>
              {relatedPinCodes.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {relatedPinCodes.map((pin) => (
                    <Link
                      key={pin}
                      to={`/search?q=${encodeURIComponent(pin)}`}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      {pin}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">No additional PIN codes found for this district.</p>
              )}
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">FAQ</h2>
              <div className="mt-4 space-y-4">
                {faqItems.map((faq) => (
                  <div key={faq.question} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{faq.question}</p>
                    <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Quick facts</h2>
              <dl className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                  <dt className="text-sm text-slate-500">PIN code</dt>
                  <dd className="text-sm font-semibold text-slate-900">{record.pincode}</dd>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                  <dt className="text-sm text-slate-500">Office type</dt>
                  <dd className="text-sm font-semibold text-slate-900">{record.office_type}</dd>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                  <dt className="text-sm text-slate-500">Delivery status</dt>
                  <dd className="text-sm font-semibold text-slate-900">{record.delivery}</dd>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                  <dt className="text-sm text-slate-500">State</dt>
                  <dd className="text-sm font-semibold text-slate-900">{record.state_name}</dd>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                  <dt className="text-sm text-slate-500">District</dt>
                  <dd className="text-sm font-semibold text-slate-900">{record.district_name}</dd>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                  <dt className="text-sm text-slate-500">Taluk</dt>
                  <dd className="text-sm font-semibold text-slate-900">{record.taluk || 'N/A'}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-sky-600 p-6 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-3 text-blue-200">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-blue-100">Quick summary</p>
                  <p className="mt-3 text-sm leading-6">
                    This page provides complete parcel and post office details for {record.office_name} in {record.state_name}. Use the share button or copy the pincode for quick access.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">More actions</h2>
              <div className="mt-4 space-y-3">
                <Link
                  to={`/search?q=${encodeURIComponent(record.district_name)}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 hover:border-blue-300 hover:bg-blue-50"
                >
                  Search more offices in {record.district_name}
                </Link>
                <Link
                  to={`/search?q=${encodeURIComponent(record.state_name)}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 hover:border-blue-300 hover:bg-blue-50"
                >
                  Browse all offices in {record.state_name}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
