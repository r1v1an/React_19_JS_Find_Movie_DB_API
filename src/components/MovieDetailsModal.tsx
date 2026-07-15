import type { Movie, MovieDetails, Genre, ProductionCompany } from "../types"
import FavoriteButton from "./FavoriteButton"
import CloseButton from "./CloseButton"
import Spinner from "./Spinner"

// Hoisted Intl formatters — создаются один раз на уровне модуля
const languageFormatter = new Intl.DisplayNames(["en"], { type: "language" });
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatCurrency = (amount: number | undefined): string => {
  if (!amount || amount === 0) return "N/A";
  return currencyFormatter.format(amount);
};

interface MovieDetailsModalProps {
  movie: Movie;
  details: MovieDetails | null;
  detailsLoading: boolean;
  detailsError: string | null;
  onClose: () => void;
}

const MovieDetailsModal = ({ movie, details, detailsLoading, detailsError, onClose }: MovieDetailsModalProps) => {

  // ========== LOADING STATE ==========
  if (detailsLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-8 bg-black/70 backdrop-blur-sm" onClick={onClose} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} aria-label="Close modal">
        <div className="bg-dark-100 p-8 rounded-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
          <Spinner />
        </div>
      </div>
    );
  }

  // ========== ERROR / NO DATA STATE — show what we have from basic movie ==========
  if (detailsError || !details) {
    const fallbackPoster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
      : "/No-Poster.png";

    const fallbackYear = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
    const fallbackRating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
    const fallbackLang = movie.original_language
      ? languageFormatter.of(movie.original_language)
      : "N/A";

    return (
      <div className="fixed inset-0 z-40 flex items-start justify-center pt-20 pb-8 bg-black/70 backdrop-blur-sm" onClick={onClose} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} aria-label="Close modal">
        <div className="relative w-full max-w-md p-8 rounded-2xl bg-dark-100 border border-white/10 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose} />

          <div className="flex flex-col items-center gap-4">
            <img src={fallbackPoster} alt={movie.title || "No poster"} className="w-32 h-48 rounded-xl object-cover shadow-lg border border-white/10" />
            <h3 className="text-white font-bold text-xl">{movie.title}</h3>
            {detailsError && (
              <p className="text-red-400 text-xs bg-red-400/10 px-3 py-1 rounded-full">{detailsError}</p>
            )}
            <p className="text-gray-100/60 text-sm">Movie details from TMDB are temporarily unavailable.</p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-100 mt-1">
              <div className="flex items-center gap-1">
                <img src="star-img.svg" alt="Star" className="size-4" />
                <span className="font-bold text-white">{fallbackRating}</span>
              </div>
              <span>•</span>
              <span>{fallbackYear}</span>
              <span>•</span>
              <span className="capitalize">{fallbackLang}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== FULL DETAILS ==========
  const {
    id,
    title,
    poster_path,
    backdrop_path,
    vote_average,
    release_date,
    runtime,
    genres,
    overview,
    tagline,
    original_language,
    budget,
    revenue,
    production_companies,
  } = details;

  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500/${poster_path}`
    : "/No-Poster.png";

  const backdropUrl = backdrop_path
    ? `https://image.tmdb.org/t/p/w1280/${backdrop_path}`
    : null;

  const year = release_date ? release_date.split("-")[0] : "N/A";
  const rating = vote_average ? vote_average.toFixed(1) : "N/A";
  const hours = runtime ? Math.floor(runtime / 60) : 0;
  const mins = runtime ? runtime % 60 : 0;
  const langName = original_language
    ? languageFormatter.of(original_language)
    : "N/A";

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-20 pb-8 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} aria-label="Close modal">
      <div className="relative w-full max-w-3xl rounded-2xl bg-dark-100 border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} />

        {/* Backdrop */}
        {backdropUrl && (
          <div className="relative w-full h-40 sm:h-48 overflow-hidden rounded-t-2xl">
            <img src={backdropUrl} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/50 to-transparent" />
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Poster + FavoriteButton */}
            <div className="flex-shrink-0 mx-auto sm:mx-0 relative z-10 group sm:mt-1 p-6">
              <img
                src={posterUrl}
                alt={title}
                className="w-40 h-60 sm:w-44 sm:h-[264px] rounded-xl object-cover shadow-lg border border-white/10"
              />
              <FavoriteButton movie={movie} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{title}</h2>
              {tagline && <p className="text-light-200 italic text-sm mb-3">&ldquo;{tagline}&rdquo;</p>}

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-100 mb-4">
                <div className="flex items-center gap-1">
                  <img src="star-img.svg" alt="Star" className="size-4" />
                  <span className="font-bold text-white">{rating}</span>
                </div>
                <span>•</span>
                <span>{year}</span>
                {runtime > 0 && (
                  <>
                    <span>•</span>
                    <span>{hours}h {mins}m</span>
                  </>
                )}
                <span>•</span>
                <span className="capitalize">{langName}</span>
              </div>

              {genres && genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((genre: Genre) => (
                    <span key={genre.id} className="px-3 py-1 text-xs font-medium rounded-full bg-light-100/10 text-light-100 border border-light-100/20">
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-white font-semibold mb-1">Overview</h3>
                {overview ? (
                  <p className="text-gray-100 text-sm leading-relaxed">{overview}</p>
                ) : (
                  <p className="text-gray-100/40 text-sm italic">No overview available</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                <div>
                  <p className="text-xs text-gray-100 uppercase tracking-wider">Budget</p>
                  <p className="text-white font-semibold">{formatCurrency(budget)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-100 uppercase tracking-wider">Revenue</p>
                  <p className="text-white font-semibold">{formatCurrency(revenue)}</p>
                </div>
                {production_companies && production_companies.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-100 uppercase tracking-wider">Production</p>
                    <p className="text-white font-semibold text-sm">
                      {production_companies.map((c: ProductionCompany) => c.name).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;