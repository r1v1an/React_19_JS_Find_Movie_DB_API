const Trending = ({ movies, error }) => {
  if (error) {
    return (
      <section className="trending">
        <p className="text-red-500">
          ⚠️ Тренды недоступны — сервис временно недоступен.
        </p>
      </section>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="trending w-full overflow-hidden mt-0">
      <div className="wrapper !py-0">
        <h2>Trending Movies</h2>
      </div>

      <ul className="!overflow-visible !w-max animate-[scroll-ticker_25s_linear_infinite] hover:[animation-play-state:paused]">
        {/* Оригинальный список */}
        {movies.map((movie, index) => (
          <li key={movie.$id}>
            <p>{index + 1}</p>
            <img
              src={
                movie.poster_url?.includes("/null")
                  ? "/No-Poster.png"
                  : movie.poster_url
              }
              alt={movie.title}
            />
          </li>
        ))}

        {/* Дубликат для бесшовной петли */}
        {movies.map((movie, index) => (
          <li key={`dup-${movie.$id}`} aria-hidden="true">
            <p>{index + 1}</p>
            <img
              src={
                movie.poster_url?.includes("/null")
                  ? "/No-Poster.png"
                  : movie.poster_url
              }
              alt={movie.title}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Trending;
