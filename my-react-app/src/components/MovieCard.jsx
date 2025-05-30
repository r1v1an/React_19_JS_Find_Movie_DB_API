const MovieCard = ({
  movie: { title, vote_average, poster_path, relase_date, russian_language },
}) => {
  return (
    <div className="movie-card">
      <p className="text-white">{title}</p>
      {/* key=id не нужен т.к. он уже есть в <MovieCard/> */}
    </div>
  );
};

export default MovieCard;
