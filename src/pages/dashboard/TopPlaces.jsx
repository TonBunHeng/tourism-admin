import { Star, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultPlaces = [
  { id: 1, name: 'Angkor Wat Complex', rating: 4.9, reviews: 1420, image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=300', category: 'Historical & Ancient Heritage' },
  { id: 2, name: 'Bayon Temple', rating: 4.8, reviews: 980, image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=300', category: 'Ancient Stone Faces' },
  { id: 3, name: 'Ta Prohm Temple', rating: 4.8, reviews: 850, image: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&q=80&w=300', category: 'Nature & Jungle Ruins' },
  { id: 4, name: 'Phnom Bakheng', rating: 4.7, reviews: 620, image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=300', category: 'Sunset Viewpoint' },
  { id: 5, name: 'Banteay Srei', rating: 4.6, reviews: 430, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=300', category: 'Pink Sandstone Carvings' }
];

const palette = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
];

export default function TopPlaces({ places, topPlaces }) {
  const navigate = useNavigate();

  const placesList = ((Array.isArray(places) && places.length > 0)
    ? places
    : ((Array.isArray(topPlaces) && topPlaces.length > 0) ? topPlaces : defaultPlaces));

  const maxReviews = Math.max(...placesList.map((p) => Number(p.reviews) || 0), 1);
  const isScrollable = placesList.length > 10;

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
          <div>
            <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Top Places</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                {placesList.length}
              </span>
            </h3>
            <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              {isScrollable
                ? `Highest rated destinations (scroll to view all ${placesList.length})`
                : 'Highest rated destinations'}
            </p>
          </div>
          <button
            onClick={() => navigate('/places')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Places list (scrollable when > 10 places) */}
        <div
          className={`space-y-3 pt-1 ${
            isScrollable ? 'max-h-[380px] overflow-y-auto pr-2' : ''
          }`}
        >
          {placesList.map((place, index) => {
            const reviewsCount = Number(place.reviews) || 0;
            const ratingVal = Number(place.rating || 5.0).toFixed(1);
            const pct = Math.max(Math.round((reviewsCount / maxReviews) * 100), reviewsCount > 0 ? 8 : 4);
            const barColor = palette[index % palette.length];

            return (
              <div
                key={place.id || index}
                className="group cursor-pointer rounded-md p-1 -m-1 hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/50 transition-colors"
                onClick={() => navigate('/places')}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold w-4 shrink-0">
                      #{index + 1}
                    </span>
                    {place.image || place.image_url ? (
                      <img
                        src={place.image || place.image_url}
                        alt={place.name}
                        className="w-5 h-5 rounded-md object-cover shrink-0 border border-gray-200 dark:border-zinc-700"
                      />
                    ) : null}
                    <span className="text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {place.name}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 hidden sm:inline truncate">
                      • {place.category || 'Attraction'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{ratingVal}</span>
                    </div>
                    <span className="text-gray-300 dark:text-zinc-600">•</span>
                    <span className="text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-semibold text-xs">
                      {reviewsCount.toLocaleString()} reviews
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[var(--color-border-light)] dark:bg-[var(--color-surface-hover-dark)] rounded-md overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-md transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
