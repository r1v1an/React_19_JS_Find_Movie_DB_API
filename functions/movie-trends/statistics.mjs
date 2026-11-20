import { createHash } from "node:crypto";
import { Query } from "node-appwrite";

const posterBase = "https://image.tmdb.org/t/p/w500/";
const posterFile = /^[a-z0-9_-]+\.(?:jpg|jpeg|png|webp)$/i;
const day = 24 * 60 * 60 * 1000;

function publicMovie(row, id, count) {
  const url = row.poster_url;
  const file = typeof url === "string" && url.startsWith(posterBase)
    ? url.slice(posterBase.length).replace(/^\/+/, "")
    : "";

  return {
    $id: id,
    movie_id: row.movie_id,
    count,
    poster_url: posterFile.test(file) ? `${posterBase}${file}` : null,
  };
}

export async function getTrends(db, { metrics, logs }, period, now) {
  if (period === "all") {
    const { rows } = await db.listRows({
      ...metrics,
      queries: [Query.orderDesc("count"), Query.limit(10)],
    });
    return rows.map((row, index) => publicMovie(row, `all-${row.movie_id}-${index}`, row.count));
  }

  const { rows } = await db.listRows({
    ...logs,
    queries: [
      Query.greaterThan("$createdAt", new Date(now - day).toISOString()),
      Query.orderDesc("$createdAt"),
      Query.limit(500),
    ],
  });
  const movies = new Map();

  for (const row of rows) {
    const movie = movies.get(row.movie_id);
    if (movie) {
      movie.count += 1;
    } else {
      movies.set(row.movie_id, publicMovie(row, `daily-${row.movie_id}`, 1));
    }
  }

  return [...movies.values()].sort((a, b) => b.count - a.count).slice(0, 10);
}

export async function saveSearch(db, { metrics, logs }, { query, eventId }, movie) {
  const file = typeof movie.poster_path === "string" ? movie.poster_path.replace(/^\//, "") : "";
  const data = {
    searchTerm: query,
    movie_id: movie.id,
    poster_url: `${posterBase}${posterFile.test(file) ? file : "null"}`,
  };
  const metricId = createHash("sha256").update(query).digest("hex").slice(0, 36);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const existingEvent = await db.listRows({ ...logs, queries: [Query.equal("$id", eventId), Query.limit(1)] });
    if (existingEvent.rows.length) return;

    const { rows: [metric] } = await db.listRows({
      ...metrics,
      queries: [Query.equal("searchTerm", query), Query.limit(1)],
    });
    const transaction = await db.createTransaction({ ttl: 60 });
    const transactionId = transaction.$id;

    try {
      await db.createOperations({
        transactionId,
        operations: [
          { ...logs, action: "create", rowId: eventId, data },
          metric
            ? { ...metrics, action: "increment", rowId: metric.$id, data: { column: "count", value: 1 } }
            : { ...metrics, action: "create", rowId: metricId, data: { ...data, count: 1 } },
        ],
      });
      await db.updateTransaction({ transactionId, commit: true });
      return;
    } catch (error) {
      await db.updateTransaction({ transactionId, rollback: true }).catch(() => {});
      if (error.code !== 409 || attempt === 2) throw error;
    }
  }
}
