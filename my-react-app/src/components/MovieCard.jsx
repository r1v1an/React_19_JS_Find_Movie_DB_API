import { useMovieContext } from "../contexts/MovieContext"

const MovieCard = ({
  movie
}) => {

  const { id, title, vote_average, poster_path, release_date, original_language } = movie;

  const {isFavorite, addToFavorites, removeFromFavorites} = useMovieContext() // Вызов функций из контекста

  const favorite = isFavorite(movie.id) // Проверка наличия movie.id в списке isFavorite

  function onFavoriteClick(e) {
    e.preventDefault()
    if (favorite) removeFromFavorites(movie.id)
    else addToFavorites(movie)
  }

  return (
    <div className="movie-card">
        <img src={poster_path ? 
                `https://image.tmdb.org/t/p/w500/${poster_path}` : '/No-Poster.png'} 
             alt={title}/>
        <div className="movie-overlay">
          <button className="favorite-btn" onClick={onFavoriteClick}>
            {favorite ? "❤️" : "🤍"}
          </button>
        </div>
        <div className="mt-4">
            <h3>{title}</h3>

            <div className="content">
                <div className="rating">
                    <img src="star-img.svg" alt="Star icon" />
                    <p>{vote_average ? vote_average.toFixed(2) : 'N/A'}</p>
                </div>

                <span>•</span> {/* dott symbol alt + 0149 */}
                <p className="lang">{original_language}</p>

                <span>•</span>
                <p className="year">{release_date ? release_date.split('-')[0] : 'N/A'}</p>
            </div>
        </div>
    </div>
  )
}

export default MovieCard
