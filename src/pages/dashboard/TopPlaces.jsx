import React from 'react';
import { Star, Landmark, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopPlaces({ places, topPlaces }) {
  const navigate = useNavigate();

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800';
      case 1:
        return 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700';
      case 2:
        return 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800';
      default:
        return 'bg-blue-50/50 dark:bg-blue-950/20 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800';
    }
  };

  const defaultPlaces = [
    { id: 1, name: 'Angkor Wat Complex', rating: 4.9, reviews: 1420, image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=300', category: 'Historical & Ancient Heritage' },
    { id: 2, name: 'Bayon Temple', rating: 4.8, reviews: 980, image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=300', category: 'Ancient Stone Faces' },
    { id: 3, name: 'Ta Prohm Temple', rating: 4.8, reviews: 850, image: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&q=80&w=300', category: 'Nature & Jungle Ruins' },
    { id: 4, name: 'Phnom Bakheng', rating: 4.7, reviews: 620, image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=300', category: 'Sunset Viewpoint' },
    { id: 5, name: 'Banteay Srei', rating: 4.6, reviews: 430, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=300', category: 'Pink Sandstone Carvings' }
  ];

  const items = ((Array.isArray(places) && places.length > 0)
    ? places
    : ((Array.isArray(topPlaces) && topPlaces.length > 0) ? topPlaces : defaultPlaces)).slice(0, 5);

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
        <div>
          <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
            Top Places
          </h3>
          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            Highest rated destinations
          </p>
        </div>
        <button
          onClick={() => navigate('/places')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          View All
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
        {items.length > 0 ? (
          items.map((place, index) => (
            <div
              key={place.id || index}
              onClick={() => navigate('/places')}
              className="flex items-start gap-3 p-2.5 rounded-md hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)] flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                {place.image || place.image_url ? (
                  <img
                    src={place.image || place.image_url}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {place.name}
                  </p>
                  <span className={`text-[10px] px-2 py-0.2 rounded-md font-semibold uppercase tracking-wider border shrink-0 ${getRankBadge(index)}`}>
                    #{index + 1}
                  </span>
                </div>

                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] line-clamp-1 mt-0.5">
                  {place.category || 'Popular Destination'}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] font-mono mt-1">
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{Number(place.rating || 5.0).toFixed(1)}</span>
                  </div>
                  <span className="text-slate-300 dark:text-zinc-600">•</span>
                  <span>{(place.reviews || 0).toLocaleString()} reviews</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            No top places available yet.
          </div>
        )}
      </div>
    </div>
  );
}
