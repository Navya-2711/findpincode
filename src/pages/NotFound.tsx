import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <MapPin className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-6xl font-black text-gray-900">404</h1>
        <p className="mt-2 text-xl text-gray-600">Page not found</p>
        <p className="mt-1 text-sm text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
