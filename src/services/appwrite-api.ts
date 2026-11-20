import { createLocalTrendsClient } from "./appwrite-dev-api";
import { appwriteEndpoint, executeMovieFunction } from "./appwrite-functions";
import type { Movie, TrendingMovie, TrendingPeriod } from "../types";

const localTrends = import.meta.env.DEV && !executeMovieFunction ? createLocalTrendsClient(appwriteEndpoint) : null;

export const isTrendingConfigured = executeMovieFunction !== null || localTrends !== null;

export async function getTrendingMovies(period: TrendingPeriod): Promise<TrendingMovie[]> {
  if (localTrends) return localTrends.getTrendingMovies(period);
  if (!executeMovieFunction) return [];

  const execution = await executeMovieFunction(`/trends?period=${period}`);

  if (execution.responseStatusCode !== 200) {
    throw new Error(`Appwrite trends request failed (${execution.responseStatusCode})`);
  }

  const response = JSON.parse(execution.responseBody) as { movies: TrendingMovie[] };
  return response.movies;
}

export async function recordSearch(query: string, movie: Movie): Promise<boolean> {
  if (localTrends) return localTrends.recordSearch(query, movie);
  if (!executeMovieFunction) return false;

  const execution = await executeMovieFunction("/searches", { query, eventId: crypto.randomUUID() });

  if (execution.responseStatusCode !== 204 && execution.responseStatusCode !== 429) {
    throw new Error(`Appwrite search recording failed (${execution.responseStatusCode})`);
  }
  return execution.responseStatusCode === 204;
}
