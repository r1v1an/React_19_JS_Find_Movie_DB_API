import { executeMovieFunction } from "./appwrite-functions";
import type { MovieDetails, SortOption, TMDBResponse } from "../types";

async function fetchMovieData<T>(path: string, failureMessage: string): Promise<T> {
  if (executeMovieFunction) {
    const execution = await executeMovieFunction(path);
    if (execution.responseStatusCode === 200) return JSON.parse(execution.responseBody) as T;
    if (execution.responseStatusCode === 429) throw new Error("Too many movie requests. Try again in a minute.");
    throw new Error(failureMessage);
  }

  if (import.meta.env.DEV && import.meta.env.VITE_TMDB_API_KEY) {
    const response = await fetch(`https://api.themoviedb.org/3${path}`, {
      headers: { accept: "application/json", Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}` },
    });
    if (response.ok) return await response.json() as T;
    throw new Error(failureMessage);
  }

  throw new Error("Movie service is not configured");
}

export const fetchMovieDetails = (movieId: number) =>
  fetchMovieData<MovieDetails>(`/movie/${movieId}?language=en-US`, "Failed to fetch movie details");

export const SORT_OPTIONS: Record<string, SortOption> = {
  POPULAR: "popularity.desc",
  TOP_RATED: "vote_average.desc",
  NEWEST: "primary_release_date.desc",
};

export const fetchMovies = (query = "", page = 1, sortBy: SortOption = SORT_OPTIONS.POPULAR) => {
  const params = new URLSearchParams({ page: String(page) });
  const searchTerm = query.trim();
  if (searchTerm) {
    params.set("query", searchTerm);
    return fetchMovieData<TMDBResponse>(`/search/movie?${params}`, "Failed to fetch movies");
  }

  params.set("sort_by", sortBy);
  if (sortBy === SORT_OPTIONS.TOP_RATED) params.set("vote_count.gte", "10000");
  if (sortBy === SORT_OPTIONS.NEWEST) {
    params.set("vote_count.gte", "100");
    params.set("primary_release_date.lte", new Date().toISOString().slice(0, 10));
  }
  return fetchMovieData<TMDBResponse>(`/discover/movie?${params}`, "Failed to fetch movies");
};
