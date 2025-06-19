import React, { useState, useEffect} from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { updateSearchCount } from "./appwrite.js";

// Подключение API TMDB
const API_BASE_URL = "https://api.themoviedb.org/3"; // сперва отправляем базовый url запрос

const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // затем ипортируем апи ключ расположенный в .env.local

const API_OPTIONS = {
  // определяем нужные параметры апи
  method: "GET",
  headers: {
    accept: "application/json", // апи отправит объект в формате джсон
    Authorization: `Bearer ${API_KEY}`, // авторизация апи подтверждает кто хочет отправить запрос
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]); // Пустое массив "поле состояния", в которое можно получить данные с API
  const [isLoading, setIsLoading] = useState(false); // "Состояние загрузки" во время получении данных с API
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Хук отложенного поискового запроса на 1 сек
  // Для предотвращения перегрузки запросами апи
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

  const fetchMovies = async (query = '') => { // query = '' параметр поискового запроса
    setIsLoading(true); // Запуск загрузки
    setErrorMessage(""); // Пустое поле ошибки

    try {
      // используется try и catch для отлова ошибок
      // Конечная точка
      const endpoint = query 
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` // encodeURIComponent() кодировка строки в URI
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      // /discover/movie + ?sort_by=popularity.desc и /search/movie + ?query=${encodeURIComponent(query)} вариации параметров прописаны в документации апи 

      // fetch встроенная функция JS которая позволяет отправлять http запросы GET, POST и т.п. на разные апи или серверы и получить ответ
      const response = await fetch(endpoint, API_OPTIONS); // вызываем конечную точку и параметры апи

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json(); // Ответ с API получен

      if (data.Response === "False") {
        // Сообщение об ошибке если данные не будут получены
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]); // Будет создан пустой массив при ошибке

        return;
      }

      setMovieList(data.results || []); // Пустой массив заполнится данными с API

      // вызов функции показа метрики с апи appwrite
      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      } 

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(`Error fetching movies: Please try again later.`); // Создание кастомной ошибки
    } finally {
      setIsLoading(false); // независимо от результата нет необходимости показывать состояние загрузки
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]); // Выполнится 1 раз при монтировании

  return (
    <main>
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

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map(
                (
                  movie 
                ) => (        // () => () способ "немедленного возвращения" при котором не нужен return и чище код
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

export default App;
