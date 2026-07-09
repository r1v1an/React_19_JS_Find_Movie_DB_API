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

export const fetchMovieDetails = async (movieId) => {
  const endpoint = `${API_BASE_URL}/movie/${movieId}?language=en-US`;
  const response = await fetch(endpoint, API_OPTIONS);

  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }

  const data = await response.json();
  return data;
};

export const fetchMovies = async (query = '', page = 1, sortBy = 'popularity.desc') => { // query = '' параметр поискового запроса

  // Дополнительные параметры для /discover/movie
  let extraParams = '';
  if (sortBy === 'vote_average.desc') {
    // Для Top Rated: минимум 10000 голосов и рейтинг от 7
    extraParams = '&vote_count.gte=10000';
  } else if (sortBy === 'primary_release_date.desc') {
    // Для Newest: фильтруем фильмы, которые уже вышли (дата релиза не позднее сегодня)
    // и имеют минимум 100 голосов (исключает N/A и малые выборки)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    extraParams = `&primary_release_date.lte=${today}&vote_count.gte=100`;
  }

  // Конечная точка
  const endpoint = query
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}` // encodeURIComponent() кодировка строки в URI
    : `${API_BASE_URL}/discover/movie?sort_by=${sortBy}&page=${page}${extraParams}`;
  // /discover/movie + ?sort_by=popularity.desc и /search/movie + ?query=${encodeURIComponent(query)} вариации параметров прописаны в документации апи 

  // fetch встроенная функция JS которая позволяет отправлять http запросы GET, POST и т.п. на разные апи или серверы и получить ответ
  const response = await fetch(endpoint, API_OPTIONS); // вызываем конечную точку и параметры апи

  if (!response.ok) {
    throw new Error("Failed to fetch movies");
  }

  const data = await response.json(); // Ответ с API получен

  return data;
  
};

export const SORT_OPTIONS = {
  POPULAR: 'popularity.desc',
  TOP_RATED: 'vote_average.desc',
  NEWEST: 'primary_release_date.desc',
};