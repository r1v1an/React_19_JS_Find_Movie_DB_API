import TrendingControls from "./TrendingControls";
import type { TrendingMovie, TrendingPeriod } from "../types"

interface TrendingProps {
  movies: TrendingMovie[];
  error: boolean;
  period: TrendingPeriod;
  onPeriodChange: (value: TrendingPeriod) => void;
}

const Trending = ({ movies, error, period, onPeriodChange }: TrendingProps) => {
  if (error) {
    return (
      <section className="trending">
        <p className="text-red-500">
          ⚠️ Тренды недоступны — сервис временно недоступен.
        </p>
      </section>
    );
  }

  return (
    <section className="trending w-full overflow-hidden mt-0">
      <div className="wrapper !py-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2>Trending Movies</h2>
          <TrendingControls period={period} onPeriodChange={onPeriodChange} />
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="wrapper !pt-4">
          <p className="text-gray-100/60 text-sm">
            {period === "daily"
              ? "No searches in the last 24 hours yet. Try searching for a movie!"
              : "No trending movies yet. Start searching!"}
          </p>
        </div>
      ) : (
        <ul className="!overflow-visible !w-max animate-[scroll-ticker_25s_linear_infinite]">
          {/* Оригинальный список */}
          {movies.map((movie, index) => (
            <li key={movie.$id}>
              <p>{index + 1}</p>
              <img
                src={
                  movie.poster_url?.includes("/null")
                    ? "/No-Poster.png"
                    : movie.poster_url
                }
                alt={movie.title}
              />
            </li>
          ))}

          {/* Дубликат для бесшовной петли */}
          {movies.map((movie, index) => (
            <li key={`dup-${movie.$id}`} aria-hidden="true">
              <p>{index + 1}</p>
              <img
                src={
                  movie.poster_url?.includes("/null")
                    ? "/No-Poster.png"
                    : movie.poster_url
                }
                alt={movie.title}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Trending;