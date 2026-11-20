const base = "https://api.themoviedb.org/3";
const moviePath = /^\/movie\/[1-9]\d{0,9}$/;
const sortOptions = new Set(["popularity.desc", "vote_average.desc", "primary_release_date.desc"]);

export function normalizeSearchTerm(value) {
  if (typeof value !== "string") return null;
  const query = value.trim().normalize("NFC");
  return query && query.length <= 150 && !/\p{Cc}/u.test(query) ? query : null;
}

export function isMoviePath(path) {
  return path === "/search/movie" || path === "/discover/movie" || moviePath.test(path);
}

export function getMovieUrl(path, query = {}, now) {
  const url = new URL(`${base}${path}`);
  if (moviePath.test(path)) {
    url.searchParams.set("language", "en-US");
    return url;
  }

  const page = query.page ?? "1";
  if (typeof page !== "string" || !/^[1-9]\d{0,2}$/.test(page) || Number(page) > 500) return null;
  url.searchParams.set("page", page);

  if (path === "/search/movie") {
    const search = normalizeSearchTerm(query.query);
    if (!search) return null;
    url.searchParams.set("query", search);
    return url;
  }

  const sort = query.sort_by ?? "popularity.desc";
  if (!sortOptions.has(sort)) return null;
  url.searchParams.set("sort_by", sort);
  if (sort === "vote_average.desc") url.searchParams.set("vote_count.gte", "10000");
  if (sort === "primary_release_date.desc") {
    url.searchParams.set("vote_count.gte", "100");
    url.searchParams.set("primary_release_date.lte", new Date(now).toISOString().slice(0, 10));
  }
  return url;
}

export async function fetchTmdb(url, token) {
  const response = await fetch(url, {
    headers: { accept: "application/json", authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("TMDB request failed");
  return response.json();
}
