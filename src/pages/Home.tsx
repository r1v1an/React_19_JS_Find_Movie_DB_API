import { useState, useEffect, useRef, useCallback } from "react";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";
import Trending from "../components/Trending";
import { fetchMovies, SORT_OPTIONS } from "../services/tmdb-api";
import { useDebounce } from "react-use";
import SortControls from "../components/SortControls";
import { updateSearchCount, getTrendingMovies } from "../services/appwrite-api";
import type { Movie, SortOption, TrendingMovie } from "../types";

const Home = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [movieList, setMovieList] = useState<Movie[]>([]); // Пустой массив "поле состояния", в которое можно получить данные с API
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // "Состояние загрузки" во время получении данных с API
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [trendingError, setTrendingError] = useState(false); // Флаг ошибки Appwrite
  const [page, setPage] = useState(1); // Текущая страница результатов
  const [hasMore, setHasMore] = useState(true); // Есть ли еще страницы с результатами
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.POPULAR); // Текущая сортировка discover
  const observer = useRef<IntersectionObserver | null>(null); // Объект IntersectionObserver для отслеживания пересечения с последним элементом списка

  // Хук отложенного поискового запроса на 1 сек
  // Для предотвращения перегрузки запросами апи
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies ?? []); // ?? [] защита от undefined на случай сбоя API
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
      setTrendingError(true); // Показываем пользователю сообщение об ошибке
    }
  };

  // useEffect() Выполнится 1 раз при монтировании

  // Сброс страницы при новом поиске
  useEffect(() => {
    setPage(1);
    setMovieList([]);
    setHasMore(true);
  }, [debouncedSearchTerm]);

  // Сброс при смене сортировки
  const handleSortChange = useCallback((newSort: SortOption) => {
    if (newSort === sortBy) return;
    setSortBy(newSort);
    setPage(1);
    setMovieList([]);
    setHasMore(true);
  }, [sortBy]);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try { 
        const data = await fetchMovies(debouncedSearchTerm, page, sortBy);
        
        if (data.results.length === 0 || page >= data.total_pages) {
          setHasMore(false);
        }

        setMovieList(prev => {
          const newList = page === 1 ? data.results : [...prev, ...data.results];
          return [...new Map(newList.map(m => [m.id, m])).values()];
        });
        
        if (debouncedSearchTerm.trim() && page === 1 && data.results.length > 0) {
          updateSearchCount(debouncedSearchTerm, data.results[0]);
        }
      } catch (error) {
        setErrorMessage((error as Error).message || "Error fetching movies");
        if (page === 1) setMovieList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
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
    loadTrendingMovies();
  }, []);

  return (
    <main className="main-content">
      <div className="pattern" />

      <div className="wrapper lg:pb-0 pb-3">
        <header className="mt-0">
          <img src="./hero-img.png" alt="Hero Banner" className="relative -z-1 lg:-mb-16 lg:-mt-16 -mb-8"/>
          <h1 className="sm:text-6xl">
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
        </header>
      </div>

      <Trending movies={trendingMovies} error={trendingError}/>

      <div className="wrapper">
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
          
          <ul>
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