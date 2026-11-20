// contexts делает доступным состояние для всего-что что находится в этом контексте.

import { createContext, useState, useContext, useEffect, useRef, type ReactNode } from "react";
import type { Movie, MovieContextValue } from "../types";

const MovieContext = createContext<MovieContextValue | null>(null);

export const useMovieContext = (): MovieContextValue => {
  const ctx = useContext(MovieContext);
  if (!ctx) throw new Error("useMovieContext must be used within MovieProvider");
  return ctx;
};

// Предоставляет состояние любому вложенному в него компоненту.
export const MovieProvider = ({ children }: { children: ReactNode }) => {
  // children - reserved props
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const isMounted = useRef(false); // Создаем ref-флаг т.к. StrictMode при двойном монтировании useEffect() стирает Local Storage

  useEffect(() => {
    // localStorage позволяет хранить данные в браузере ТОЛЬКО в виде строк.
    if (!isMounted.current) {
      // Проверяем, не монтировались ли уже
      const storedFavs = localStorage.getItem("favorites:v1"); // проверка наличия данных по ключу "favorites:v1"

      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs) as Movie[]); // JSON.parse преобразует строку storedFavs в объект
      }
      isMounted.current = true; // Помечаем как монтированное
    }
  }, []);

  useEffect(() => {
    if (isMounted.current) {    // Сохраняем только после монтирования
      localStorage.setItem("favorites:v1", JSON.stringify(favorites)); // JSON.stringify преобразование обратно в строку. v1 — версионирование для защиты от сбоев при смене схемы
    } 
  }, [favorites]);
  // Каждый раз когда состояние favorites меняется хуки useEffect() преобразуют и обновляют локальное хранилище

  // Добавление в избранное
  const addToFavorites = (movie: Movie) => {
    setFavorites((prev) => [...prev, movie]);
  };

  // Удаление из избранного
  const removeFromFavorites = (movieId: number) => {
    // Новый массив movie.id в котором содержатся фильмы, которые не равны movieId
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
  };
  // Проверка является ли что-то избранным
  const isFavorite = (movieId: number) => {
    return favorites.some((movie) => movie.id === movieId);
  };

  // Определение какие значения value будут передаваться дочерним компонентам
  const value: MovieContextValue = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  // <BrowserRouter> <MovieProvider> <App/> <MovieProvider/> <BrowserRouter/>
  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};