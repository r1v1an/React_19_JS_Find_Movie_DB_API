import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { Client, Query, TablesDB } from "node-appwrite";
import { getTrends, saveSearch } from "./statistics.mjs";
import { fetchTmdb, getMovieUrl, isMoviePath, normalizeSearchTerm } from "./tmdb.mjs";

const minute = 60_000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseSearch(body) {
  if (typeof body !== "string" || Buffer.byteLength(body) > 1024) return null;

  try {
    const payload = JSON.parse(body);
    if (typeof payload?.eventId !== "string" || !uuid.test(payload.eventId)) return null;
    const query = normalizeSearchTerm(payload.query);
    if (!query) return null;

    return { query, eventId: payload.eventId.toLowerCase() };
  } catch {
    return null;
  }
}

async function takeRateLimitSlot(db, table, ip, secret, now, movieRequest) {
  const window = Math.floor(now / minute);
  const bucket = movieRequest ? "movies" : "trends";
  const rowId = createHmac("sha256", secret).update(`${window}:${bucket}:${ip}`).digest("hex").slice(0, 36);

  try {
    await db.createRow({ ...table, rowId, data: { count: 1 } });
    return true;
  } catch (error) {
    if (error.code !== 409) throw error;
  }

  const { count } = await db.incrementRowColumn({ ...table, rowId, column: "count", value: 1 });
  return count <= (movieRequest ? 60 : 30);
}

export default async ({ req, res, error }) => {
  const scheduled = req.headers["x-appwrite-trigger"] === "schedule";
  const reading = req.method === "GET" && req.path === "/trends";
  const writing = req.method === "POST" && req.path === "/searches";
  const movieRequest = req.method === "GET" && isMoviePath(req.path);
  const now = Date.now();

  if (!scheduled && !reading && !writing && !movieRequest) return res.json({ error: "Route not found" }, 404);

  const period = req.query?.period;
  if (reading && period !== "all" && period !== "daily") {
    return res.json({ error: "Invalid trend period" }, 400);
  }

  const search = writing ? parseSearch(req.bodyText) : null;
  if (writing && !search) return res.json({ error: "Invalid search event" }, 400);

  const movieUrl = movieRequest ? getMovieUrl(req.path, req.query, now) : null;
  if (movieRequest && !movieUrl) return res.json({ error: "Invalid movie request" }, 400);

  const ip = req.headers["x-appwrite-client-ip"];
  if (!scheduled && (typeof ip !== "string" || !isIP(ip))) {
    return res.json({ error: "Missing client address" }, 400);
  }

  const {
    APPWRITE_FUNCTION_API_ENDPOINT: endpoint,
    APPWRITE_FUNCTION_PROJECT_ID: projectId,
    DATABASE_ID: databaseId,
    METRICS_TABLE_ID: metricsId,
    SEARCH_LOGS_TABLE_ID: logsId,
    RATE_LIMIT_TABLE_ID: limitsId,
    RATE_LIMIT_SECRET: rateLimitSecret,
    TMDB_READ_ACCESS_TOKEN: tmdbToken,
  } = process.env;
  const key = req.headers["x-appwrite-key"];

  if (!endpoint || !projectId || !key || !databaseId || !metricsId || !logsId || !limitsId ||
      !rateLimitSecret || rateLimitSecret.length < 32 || ((writing || movieRequest) && !tmdbToken)) {
    error("Missing movie-trends configuration");
    return res.json({ error: "Statistics unavailable" }, 503);
  }

  const db = new TablesDB(new Client().setEndpoint(endpoint).setProject(projectId).setKey(key));
  const tables = {
    metrics: { databaseId, tableId: metricsId },
    logs: { databaseId, tableId: logsId },
  };
  const limits = { databaseId, tableId: limitsId };

  try {
    if (scheduled) {
      const cutoff = new Date(now - 2 * 60 * minute).toISOString();
      const queries = [Query.lessThan("$createdAt", cutoff), Query.limit(100)];
      for (let batch = 0; batch < 10; batch += 1) {
        const { rows } = await db.deleteRows({ ...limits, queries });
        if (rows.length < 100) break;
      }
      return res.empty();
    }

    if (!await takeRateLimitSlot(db, limits, ip, rateLimitSecret, now, movieRequest)) {
      return res.json({ error: "Too many requests" }, 429, {
        "retry-after": String(Math.ceil((minute - now % minute) / 1000)),
      });
    }

    if (reading) {
      const movies = await getTrends(db, tables, period, now);
      return res.json({ movies }, 200);
    }

    if (movieUrl) return res.json(await fetchTmdb(movieUrl, tmdbToken), 200);

    const searchUrl = getMovieUrl("/search/movie", { query: search.query }, now);
    const { results } = await fetchTmdb(searchUrl, tmdbToken);
    if (!Array.isArray(results)) throw new Error("Invalid TMDB search response");
    const movie = results[0];
    if (movie && Number.isSafeInteger(movie.id) && movie.id > 0) {
      await saveSearch(db, tables, search, movie);
    }
    return res.empty();
  } catch (cause) {
    error(`Movie statistics request failed (${cause.code ?? cause.name})`);
    return res.json({ error: "Statistics unavailable" }, 503);
  }
};
