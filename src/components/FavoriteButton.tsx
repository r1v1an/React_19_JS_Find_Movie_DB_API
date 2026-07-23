import { useMovieContext } from "../contexts/MovieContext"
import type { Movie } from "../types"

interface FavoriteButtonProps {
  movie: Movie;
  className?: string;
  variant?: "card" | "modal";
}

const FavoriteButton = ({ movie, className = "", variant = "card" }: FavoriteButtonProps) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const favorite = isFavorite(movie.id);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) removeFromFavorites(movie.id);
    else addToFavorites(movie);
  }

  return (
    <button type="button"
      className={`
        ${variant === "card" ? "favorite-btn" : ""}
        z-20 transition-all duration-200 text-[1.5rem] size-10 rounded-full bg-black/50 hover:bg-black/80
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