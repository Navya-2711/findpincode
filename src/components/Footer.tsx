import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <span>
                Pincode<span className="text-blue-400">Finder</span>
              </span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
              Discover postal information across India with a fast, reliable, and accessible directory for PIN codes, post offices, districts, cities, and states.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Quick links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="transition-colors hover:text-blue-400">Home</Link></li>
              <li><Link to="/states" className="transition-colors hover:text-blue-400">Find by State</Link></li>
              <li><Link to="/blog" className="transition-colors hover:text-blue-400">Latest Blogs</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-blue-400">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>support@pincodefinder.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span>1800-XXX-XXXX</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} PincodeFinder. All rights reserved.</p>
          <p>Reliable postal data for India.</p>
        </div>
      </div>
    </footer>
  );
}
