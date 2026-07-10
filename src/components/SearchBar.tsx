import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, Search, Sparkles } from 'lucide-react';

type Props = {
  initialQuery?: string;
  size?: 'lg' | 'md';
  autoFocus?: boolean;
};

const RECENT_SEARCHES_STORAGE_KEY = 'pincode-finder-recent-searches';
const quickSuggestions = [
  { value: '110001', label: '110001', description: 'New Delhi', type: 'Pincode' },
  { value: 'Connaught Place', label: 'Connaught Place', description: 'Area / landmark', type: 'Area' },
  { value: 'Mumbai', label: 'Mumbai', description: 'City', type: 'City' },
  { value: 'Karnataka', label: 'Karnataka', description: 'State', type: 'State' },
  { value: 'Bengaluru Urban', label: 'Bengaluru Urban', description: 'District', type: 'District' },
  { value: 'Delhi GPO', label: 'Delhi GPO', description: 'Post office', type: 'Post Office' },
];

export default function SearchBar({ initialQuery = '', size = 'lg', autoFocus = false }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setRecentSearches(parsed.filter(Boolean));
      }
    } catch {
      window.localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    }
  }, []);

  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    const recentMatches = recentSearches
      .filter((item) => item.toLowerCase().includes(trimmed))
      .slice(0, 3)
      .map((item) => ({ value: item, label: item, description: 'Recent search', type: 'Recent' }));

    const directMatches = quickSuggestions.filter((item) => {
      const haystack = `${item.value} ${item.description}`.toLowerCase();
      return trimmed ? haystack.includes(trimmed) : true;
    });

    const combined = [...recentMatches, ...directMatches];
    return combined.filter((item, index, entries) => index === entries.findIndex((entry) => entry.value === item.value)).slice(0, 6);
  }, [query, recentSearches]);

  const saveRecentSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleSelect = (value: string) => {
    setQuery(value);
    setShowSuggestions(false);
    saveRecentSearch(value);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setShowSuggestions(false);
    saveRecentSearch(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const isLg = size === 'lg';
  const inputHeight = isLg ? 'h-14 text-lg' : 'h-11 text-base';
  const btnHeight = isLg ? 'h-10' : 'h-8';
  const btnPadding = isLg ? 'px-5' : 'px-4';

  return (
    <form onSubmit={onSubmit} className="w-full" role="search">
      <div className="relative">
        <div className="relative flex items-center rounded-full border border-slate-200 bg-white shadow-sm ring-0 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
            placeholder="Search by PIN Code, Post Office, Area, District, City, or State"
            autoFocus={autoFocus}
            aria-label="Search pincode, post office, area, district, city, or state"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions && suggestions.length > 0}
            className={`w-full ${inputHeight} pl-12 pr-28 rounded-full bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none`}
          />
          <button
            type="submit"
            className={`absolute right-2 ${btnHeight} ${btnPadding} rounded-full bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700`}
          >
            Search
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul id="search-suggestions" className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            {suggestions.map((item) => (
              <li key={item.value}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item.value)}
                >
                  <span className="flex items-center gap-3">
                    {item.type === 'Recent' ? (
                      <Clock3 className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-blue-500" />
                    )}
                    <span>
                      <span className="block font-medium text-slate-900">{item.label}</span>
                      <span className="block text-xs text-slate-500">{item.description}</span>
                    </span>
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {item.type}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
