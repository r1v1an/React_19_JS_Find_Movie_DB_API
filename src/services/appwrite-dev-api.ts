import { Client, Databases, ID, Query, type Models } from "appwrite";
import type { Movie, TrendingMovie, TrendingPeriod } from "../types";

type SearchDocument = Models.Document & {
  movie_id: number;
  poster_url: string;
  count?: number;
};

const posterBase = "https://image.tmdb.org/t/p/w500/";

function toTrendingMovie(document: SearchDocument): TrendingMovie {
  const posterFile = document.poster_url?.startsWith(posterBase)
    ? document.poster_url.slice(posterBase.length).replace(/^\/+/, "")
    : "";

  return {
    $id: document.$id,
    movie_id: document.movie_id,
    count: document.count ?? 0,
    poster_url: /^[\w-]+\.(?:jpe?g|png|webp)$/i.test(posterFile) ? `${posterBase}${posterFile}` : null,
  };
}

export function createLocalTrendsClient(endpoint: string) {
  const {
    VITE_APPWRITE_PROJECT_ID: projectId,
    VITE_APPWRITE_DATABASE_ID: databaseId,
    VITE_APPWRITE_COLLECTION_ID: metricsId,
    VITE_APPWRITE_COLLECTION_LOGS_ID: logsId,
  } = import.meta.env;
  if (!projectId || !databaseId || !metricsId || !logsId) return null;

  const db = new Databases(new Client().setEndpoint(endpoint).setProject(projectId));

  const getTrendingMovies = async (period: TrendingPeriod): Promise<TrendingMovie[]> => {
    if (period === "all") {
      const { documents } = await db.listDocuments<SearchDocument>(databaseId, metricsId, [
        Query.orderDesc("count"),
        Query.limit(10),
      ]);
      return documents.map(toTrendingMovie);
    }

    const cutoff = new Date(Date.now() - 86_400_000).toISOString();
    const { documents } = await db.listDocuments<SearchDocument>(databaseId, logsId, [
      Query.greaterThan("$createdAt", cutoff),
      Query.orderDesc("$createdAt"),
      Query.limit(500),
    ]);
    const byMovie = new Map<number, TrendingMovie>();

    for (const document of documents) {
      const movie = byMovie.get(document.movie_id);
      if (movie) movie.count += 1;
      else byMovie.set(document.movie_id, { ...toTrendingMovie(document), count: 1 });
    }

    return [...byMovie.values()].sort((a, b) => b.count - a.count).slice(0, 10);
  };

  const recordSearch = async (query: string, movie: Movie): Promise<boolean> => {
    const data = {
      searchTerm: query,
      movie_id: movie.id,
      poster_url: `${posterBase}${movie.poster_path?.replace(/^\//, "") ?? "null"}`,
    };
    const { documents: [metric] } = await db.listDocuments(databaseId, metricsId, [
      Query.equal("searchTerm", query),
      Query.limit(1),
    ]);

    await Promise.all([
      metric
        ? db.incrementDocumentAttribute(databaseId, metricsId, metric.$id, "count", 1)
        : db.createDocument(databaseId, metricsId, ID.unique(), { ...data, count: 1 }),
      db.createDocument(databaseId, logsId, ID.unique(), data),
    ]);
    return true;
  };

  return { getTrendingMovies, recordSearch };
}
