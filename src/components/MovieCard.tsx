import { useState, useCallback } from "react"
import type { Movie, MovieDetails } from "../types"
import MovieDetailsModal from "./MovieDetailsModal"
import { fetchMovieDetails } from "../services/tmdb-api"
import FavoriteButton from "./FavoriteButton"

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {

  const { id, title, vote_average, poster_path, release_date, original_language } = movie;

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const handleCardClick = useCallback(async () => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const data = await fetchMovieDetails(movie.id);
      setDetails(data);
    } catch (err: unknown) {
      setDetailsError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setDetailsLoading(false);
    }
  }, [movie.id]);

  const handleClose = useCallback(() => {
    setDetailsOpen(false);
    setDetails(null);
    setDetailsError(null);
  }, []);

  return (
    <>
      <div className="movie-card group cursor-pointer" onClick={handleCardClick}>
        <img
          src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/No-Poster.png'}
          alt={title}
        />
        <FavoriteButton movie={movie} />
        <div className="movie-overlay"></div>
        <div className="mt-4">
          <h3>{title}</h3>
          <div className="content">
            <div className="rating">
              <img src="star-img.svg" alt="Star icon" />
              <p>{vote_average ? vote_average.toFixed(2) : 'N/A'}</p>
            </div>
            <span>•</span>
            <p className="lang">{original_language}</p>
            <span>•</span>
            <p className="year">{release_date ? release_date.split('-')[0] : 'N/A'}</p>
          </div>
        </div>
      </div>

      {detailsOpen && (
        <MovieDetailsModal
          movie={movie}
          details={details}
          detailsLoading={detailsLoading}
          detailsError={detailsError}
          onClose={handleClose}
        />
      )}
    </>
  )
}

export default MovieCard