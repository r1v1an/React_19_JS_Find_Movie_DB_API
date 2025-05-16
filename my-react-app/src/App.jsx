import React, { useState, useEffect } from "react";
import Search from "./components/Search";

// Подключение API TMDB 
const API_BASE_URL = 'https://api.themoviedb.org/3'; // сперва отправляем базовый url запрос

const API_KEY = import.meta.VITE_TMDB_API_KEY; // затем ипортируем апи ключ расположенный в .env.local

const API_OPTIONS = { // определяем нужные параметры апи
  method: 'GET',
  headers: {
    accept: 'application/json', // апи отправит объект в формате джсон
    Authorization: `Bearer ${API_KEY}` // авторизация апи подтверждает кто хочет отправить запрос
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const fetchMovies = async () => {
    try {                                                                       // используется try и catch для отлова ошибок
      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`; // Конечная точка

      // fetch встроенная функция JS которая позволяет отправлять http запросы GET, POST и т.п. на разные апи или серверы и получить ответ
      const response = await fetch(endpoint, API_OPTIONS);  // вызываем конечную точку и параметры апи

      throw new Error(`Failed to fetch movies`);

    } catch(error) {
    console.error(`Error fetching movies: ${error}`);
    setErrorMessage(`Error fetching movies: Please try again later.`); // Создание кастомной ошибки
    }
  }

  useEffect(() => {
    fetchMovies();
  }, []); // Выполнится 1 раз при монтировании

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner"/>
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        <section className="all-movies">
          <h2>All Movies</h2>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </section>
      </div>

    </main>
  );
};

export default App;
