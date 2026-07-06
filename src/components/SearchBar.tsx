import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

type Props = {
  initialQuery?: string;
  size?: 'lg' | 'md';
  autoFocus?: boolean;
};

export default function SearchBar({ initialQuery = '', size = 'lg', autoFocus = false }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const isLg = size === 'lg';
  const inputHeight = isLg ? 'h-14 text-lg' : 'h-11 text-base';
  const btnHeight = isLg ? 'h-10' : 'h-8';
  const btnPadding = isLg ? 'px-5' : 'px-4';

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by pincode or area name (e.g. 110001 or Connaught Place)"
          autoFocus={autoFocus}
          className={`w-full ${inputHeight} pl-12 pr-28 rounded-full border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
        />
        <button
          type="submit"
          className={`absolute right-2 ${btnHeight} ${btnPadding} rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors`}
        >
          Search
        </button>
      </div>
    </form>
  );
}
