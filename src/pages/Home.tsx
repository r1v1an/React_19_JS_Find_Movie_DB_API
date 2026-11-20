import { useState, useEffect, useRef, useCallback } from "react";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";
import Trending from "../components/Trending";
import { fetchMovies, SORT_OPTIONS } from "../services/tmdb-api";
import { useDebounce } from "react-use";
import SortControls from "../components/SortControls";
import { getTrendingMovies, isTrendingConfigured, recordSearch } from "../services/appwrite-api";
import type { Movie, SortOption, TrendingMovie, TrendingPeriod } from "../types";

const Home = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [movieList, setMovieList] = useState<Movie[]>([]); // Пустой массив "поле состояния", в которое можно получить данные с API
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // "Состояние загрузки" во время получении данных с API
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [trendingError, setTrendingError] = useState(false); // Флаг ошибки Appwrite
  const [trendingPeriod, setTrendingPeriod] = useState<TrendingPeriod>("all"); // Период трендов
  const [trendingRevision, setTrendingRevision] = useState(0);
  const [page, setPage] = useState(1); // Текущая страница результатов
  const [hasMore, setHasMore] = useState(true); // Есть ли еще страницы с результатами
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.POPULAR); // Текущая сортировка discover
  const observer = useRef<IntersectionObserver | null>(null); // Объект IntersectionObserver для отслеживания пересечения с последним элементом списка

  // Хук отложенного поискового запроса на 1 сек
  // Для предотвращения перегрузки запросами апи
  // Сброс page, movieList и hasMore происходит здесь, а не в отдельном эффекте
  useDebounce(() => {
    setPage(1);
    setHasMore(true);
    setDebouncedSearchTerm(searchTerm);
    if (!searchTerm) return; // Не очищаем список при пустом поиске (discover mode)
    setMovieList([]);
  }, 1000, [searchTerm]);

  // Сброс при смене сортировки
  const handleSortChange = useCallback((newSort: SortOption) => {
    if (newSort === sortBy) return;
    setSortBy(newSort);
    setPage(1);
    setHasMore(true);
  }, [sortBy]);

  // Переключение периода трендов
  const handleTrendingPeriodChange = useCallback((period: TrendingPeriod) => {
    if (period === trendingPeriod) return;
    setTrendingMovies([]);
    setTrendingPeriod(period);
    setTrendingError(false);
  }, [trendingPeriod]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try { 
        const data = await fetchMovies(debouncedSearchTerm, page, sortBy);
        if (cancelled) return;
        
        if (data.results.length === 0 || page >= Math.min(data.total_pages, 500)) {
          setHasMore(false);
        }

        setMovieList(prev => {
          const newList = page === 1 ? data.results : [...prev, ...data.results];
          return [...new Map(newList.map(m => [m.id, m])).values()];
        });
        
        if (debouncedSearchTerm.trim() && page === 1 && data.results.length > 0) {
          void recordSearch(debouncedSearchTerm, data.results[0])
            .then((saved) => {
              if (saved) setTrendingRevision((revision) => revision + 1);
            })
            .catch((error: unknown) => {
              console.error("Error recording search statistics", error);
            });
        }
      } catch (error) {
        if (cancelled) return;
        setErrorMessage((error as Error).message || "Error fetching movies");
        if (page === 1) setMovieList([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [debouncedSearchTerm, page, sortBy]);
  
  // Использован IntersectionObserver с помощью хука useCallback (lastMovieElementRef), 
  // который отслеживает, доскроллил ли пользователь до последнего элемента в списке.
  const lastMovieElementRef = useCallback((node: HTMLDivElement | null) => { 
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  useEffect(() => {
    let cancelled = false;
    void getTrendingMovies(trendingPeriod).then((movies) => {
      if (cancelled) return;
      setTrendingMovies(movies);
      setTrendingError(false);
    }).catch((error: unknown) => {
      if (cancelled) return;
      console.error("Error fetching trending movies", error);
      setTrendingError(true);
    });
    return () => { cancelled = true; };
  }, [trendingPeriod, trendingRevision]);

  return (
    <main className="main-content">
      <div className="pattern" />

      <div className="wrapper lg:pb-0 pb-3">
        <header className="mt-0">
          <img src={`${import.meta.env.BASE_URL}hero-img.png`} alt="Hero Banner" className="relative -z-1 lg:-mb-16 lg:-mt-16 -mb-8"/>
          <h1 className="sm:text-6xl">
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
        </header>
      </div>

      {isTrendingConfigured && (
        <Trending
          movies={trendingMovies}
          error={trendingError}
          period={trendingPeriod}
          onPeriodChange={handleTrendingPeriodChange}
        />
      )}

      <div className="wrapper pt-0">
        <section className="all-movies">
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="!mb-0">All Movies</h2>
            <SortControls
              sortBy={sortBy}
              onSortChange={handleSortChange}
              disabled={!!debouncedSearchTerm}
            />
          </div>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          
          <ul className={isLoading ? "opacity-50 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
            {movieList.map((movie, index) => {
              if (movieList.length === index + 1) {
                return (
                  <div ref={lastMovieElementRef} key={movie.id}>
                    <MovieCard movie={movie} />
                  </div>
                );
              } else {
                return <MovieCard key={movie.id} movie={movie} />;
              }
            })}
          </ul>

          {isLoading && (
            <div className="mt-8 flex justify-center">
              <Spinner />
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Home;
