// ========== TMDB Movie types ==========

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  original_language: string;
  overview?: string;
}

export interface MovieDetails {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  runtime: number;
  genres: Genre[];
  overview: string | null;
  tagline: string | null;
  original_language: string;
  budget: number;
  revenue: number;
  production_companies: ProductionCompany[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
}

export interface TMDBResponse {
  results: Movie[];
  total_pages: number;
  total_results: number;
  page: number;
}

// ========== Appwrite types ==========

export interface TrendingMovie {
  $id: string;
  searchTerm: string;
  count: number;
  movie_id: number;
  poster_url: string;
  title?: string;
}

// ========== Sort options ==========

export type SortOption = 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc';

export const SORT_OPTIONS: Record<string, SortOption> = {
  POPULAR: 'popularity.desc',
  TOP_RATED: 'vote_average.desc',
  NEWEST: 'primary_release_date.desc',
};

// ========== Trending period ==========

export type TrendingPeriod = 'all' | 'daily';

// ========== Context types ==========

export interface MovieContextValue {
  favorites: Movie[];
  addToFavorites: (movie: Movie) => void;
  removeFromFavorites: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
}