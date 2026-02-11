import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";

function Favorites() {
  const { favorites } = useMovieContext();

  if (favorites.length > 0) {
    return (
      <div>
        <div className="pattern"></div>
        <div className="wrapper">
          <div className="all-movies favorites">
            <h2 className="mt-7">Your Favorites</h2>
            <ul>
              {favorites.map(
                (
                  movie // () => () способ "немедленного возвращения" при котором не нужен return и чище код
                ) => (
                  <MovieCard key={movie.id} movie={movie} /> // Нужен уникальный ключ для каждого элемента .id
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pattern"></div>
      <div className="wrapper">
        <div className="all-movies favorites-empty">
          <h2>No Favorites Movies yet</h2>
          <p>Start adding movies to your favorites and they will appear here!</p>
        </div>
      </div>
    </div>
  );
}

export default Favorites;
