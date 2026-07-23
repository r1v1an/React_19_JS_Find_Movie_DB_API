import { useState, useEffect } from "react"
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
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);

  const [isPortrait, setIsPortrait] = useState(
    () => typeof window !== "undefined" && window.innerHeight > window.innerWidth
  );

  useEffect(() => {
    const onResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ========== LOADING STATE ==========
  if (detailsLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} aria-label="Close modal">
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
      <div className="fixed inset-0 z-40 flex items-center justify-center sm:pt-6 p-4 bg-black/70 backdrop-blur-sm" onClick={onClose} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} aria-label="Close modal">
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

  const backdropUrl = backdrop_path
    ? `https://image.tmdb.org/t/p/w1280/${backdrop_path}`
    : null;

  const posterFallbackUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
    : null;

  const modalBgUrl = backdropUrl ?? posterFallbackUrl;

  const year = release_date ? release_date.split("-")[0] : "N/A";
  const rating = vote_average ? vote_average.toFixed(1) : "N/A";
  const hours = runtime ? Math.floor(runtime / 60) : 0;
  const mins = runtime ? runtime % 60 : 0;
  const langName = original_language
    ? languageFormatter.of(original_language)
    : "N/A";

  const aspectRatio = imgNatural ? imgNatural.w / imgNatural.h : 16 / 9;
  const isImagePortrait = imgNatural ? imgNatural.h > imgNatural.w : false;

  // Вычисляем размеры модалки
  const modalStyle: React.CSSProperties = {};
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 720;

  if (isPortrait) {
    // Мобильные / планшеты: высота 70vh, ширина = ширина экрана минус margin
    modalStyle.height = "70vh";
    modalStyle.maxWidth = "calc(100vw - 1.5rem)";
  } else {
    // Десктоп:
    const maxW = Math.min(vw * 0.9, 1200);
    const maxH = vh * 0.85;

    if (isImagePortrait) {
      // Картинка вертикальная (например 9x16) → лимитируем по высоте, ширину вычисляем
      const h = maxH;
      const w = h * aspectRatio; // aspectRatio < 1, ширина будет меньше
      modalStyle.width = `${w}px`;
      modalStyle.height = `${h}px`;
    } else {
      // Горизонтальная картинка → лимитируем по ширине, высоту вычисляем
      let h = maxW / aspectRatio;
      if (h > maxH) h = maxH;
      modalStyle.width = `${maxW}px`;
      modalStyle.height = `${h}px`;
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center sm:mt-8 p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} aria-label="Close modal">
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Фон во всю высоту модалки */}
        {modalBgUrl && (
          <img
            src={modalBgUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
              }
            }}
          />
        )}
        {/* Затемнение: градиент от прозрачного сверху до тёмного снизу */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <CloseButton onClick={onClose} />

        <div className="relative p-5 sm:p-8 flex flex-col h-full overflow-y-auto pt-16 sm:pt-20">
          {/* ===== HERO — контент поверх фона ===== */}
          <div className="relative z-10 flex-1">
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight drop-shadow-lg flex items-center gap-3 flex-wrap">
              <span>{title}</span>
              <FavoriteButton
                movie={movie}
                variant="modal"
                className="opacity-100 transition-all duration-200 flex-shrink-0 text-lg"
              />
            </h2>

            {tagline && <p className="text-light-200 italic text-sm drop-shadow mt-1">&ldquo;{tagline}&rdquo;</p>}

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/90 mt-3 drop-shadow">
              <div className="flex items-center gap-1">
                <img src="star-img.svg" alt="Star" className="size-4" />
                <span className="font-bold text-white">{rating}</span>
              </div>
              <span aria-hidden="true">•</span>
              <span>{year}</span>
              {runtime > 0 && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{hours}h {mins}m</span>
                </>
              )}
              <span aria-hidden="true">•</span>
              <span className="capitalize">{langName}</span>
            </div>

            {genres && genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {genres.map((genre: Genre) => (
                  <span key={genre.id} className="px-3 py-1 text-xs font-medium rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-sm">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ===== Overview — поверх фона с лёгкой тенью ===== */}
          <div className="relative z-10 mt-4">
            {overview && (
              <p className="text-white text-sm leading-relaxed max-w-prose drop-shadow-md">
                {overview}
              </p>
            )}
          </div>

          {/* ===== Статистика — компактные чипы поверх фона ===== */}
          <div className="relative z-10 mt-4 flex flex-wrap gap-3">
            <div className="rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-2">
              <p className="text-[10px] text-gray-100/60 uppercase tracking-wider">Budget</p>
              <p className="text-white font-semibold text-xs">{formatCurrency(budget)}</p>
            </div>
            <div className="rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-2">
              <p className="text-[10px] text-gray-100/60 uppercase tracking-wider">Revenue</p>
              <p className="text-white font-semibold text-xs">{formatCurrency(revenue)}</p>
            </div>
            {production_companies && production_companies.length > 0 && (
              <div className="rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-2">
                <p className="text-[10px] text-gray-100/60 uppercase tracking-wider">Production</p>
                <p className="text-white text-xs">
                  {production_companies.map((c: ProductionCompany) => c.name).join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default MovieDetailsModal;