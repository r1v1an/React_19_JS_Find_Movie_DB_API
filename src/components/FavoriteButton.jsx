import { useMovieContext } from "../contexts/MovieContext"

const FavoriteButton = ({ movie, className = "" }) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const favorite = isFavorite(movie.id);

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) removeFromFavorites(movie.id);
    else addToFavorites(movie);
  }

  return (
    <button
      className={`favorite-btn z-20
        transition-all duration-200
        ${favorite
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-100 max-md:opacity-100"
        }
        ${className}
      `}
      onClick={onClick}
    >
      {favorite ? "❤️" : "🤍"}
    </button>
  );
};

export default FavoriteButton;