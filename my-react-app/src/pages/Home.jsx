import { useState, useEffect } from "react";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";
import { fetchMovies } from "../services/tmdb-api";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "../services/appwrite-api";

const Home = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [movieList, setMovieList] = useState([]); // Пустой массив "поле состояния", в которое можно получить данные с API
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // "Состояние загрузки" во время получении данных с API
  const [trendingMovies, setTrendingMovies] = useState([]);

  // Хук отложенного поискового запроса на 1 сек
  // Для предотвращения перегрузки запросами апи
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies(); // Обязательно импортируйте функции из appwrite

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  // useEffect() Выполнится 1 раз при монтировании

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await fetchMovies(debouncedSearchTerm);
        setMovieList(data.results || []);
        if (debouncedSearchTerm.trim()) {
          updateSearchCount(debouncedSearchTerm, data.results[0]);
        }
      } catch (error) {
        setErrorMessage(error.message || "Error fetching movies");
        setMovieList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(debouncedSearchTerm);
    
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main className="main-content">
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && ( // Условное замыкание &&
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map(
                (
                  movie,
                  index // .map преобразуем массив с БД
                ) => (
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
                )
              )}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? ( // Условный рендеринг ? :
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map(
                (
                  movie // () => () способ "немедленного возвращения" при котором не нужен return и чище код
                ) => (
                  <MovieCard key={movie.id} movie={movie} /> // Нужен уникальный ключ для каждого элемента .id
                )
              )}
            </ul>
          )}
          ;
        </section>
      </div>
    </main>
  );
};

export default Home;
