// contexts делает доступным состояние для всего-что что находится в этом контексте.

import { createContext, useState, useContext, useEffect } from "react";

const MovieContext = createContext()

export const useMovieContext = () => useContext(MovieContext);

// Предоставляет состояние любому вложенному в него компоненту.
export const MovieProvider = ({children}) => { // children - reserved props
    const [favorites, setFavorites] = useState([])

    useEffect(() => {
// localStorage позволяет хранить данные в браузере ТОЛЬКО в виде строк.
        const storedFavs = localStorage.getItem("favorites") // ищет есть ли уже данные по ключу "favorites"

        if (storedFavs) setFavorites(JSON.parse(storedFavs)) // JSON.parse преобразует строку storedFavs в объект 
    }, [])

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites)) // JSON.stringify преобразование обратно в строку
    }, [favorites])
// Каждый раз когда состояние favorites меняется хуки useEffect() преобразуют и обновляют локальное хранилище

// Добавление в избранное
    const addToFavorites = (movie) => {
        setFavorites(prev => [...prev, movie])
    }

// Удаление из избранного
    const removeFromFavorites = (movieId) => {
// Новый массив movie.id в котором содержатся фильмы, которые не равны movieId
        setFavorites(prev => prev.filter(movie => movie.id !== movieId))  
    }
// Проверка является ли что-то избранным
    const isFavorite = (movieId) => {
        return favorites.some(movie => movie.id === movieId)
    }

// Определение какие значения value будут передаваться дочерним компонентам    
    const value = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite 
    }

// <BrowserRouter> <MovieProvider> <App/> <MovieProvider/> <BrowserRouter/>
    return <MovieContext.Provider value={value}>
        {children}
    </MovieContext.Provider>
} 