import assert from "node:assert/strict";
import { test } from "node:test";
import { TablesDB } from "node-appwrite";
import handleRequest from "./index.mjs";

Object.assign(process.env, {
  APPWRITE_FUNCTION_API_ENDPOINT: "https://appwrite.test/v1",
  APPWRITE_FUNCTION_PROJECT_ID: "project",
  DATABASE_ID: "stats",
  METRICS_TABLE_ID: "metrics",
  SEARCH_LOGS_TABLE_ID: "search_logs",
  RATE_LIMIT_TABLE_ID: "rate_limits",
  RATE_LIMIT_SECRET: "test-secret-not-used-outside-test-suite",
  TMDB_READ_ACCESS_TOKEN: "test-token",
});

const eventId = "ea9b1f07-6a65-4119-b9b6-552bac51b5ee";
const search = { method: "POST", path: "/searches", bodyText: JSON.stringify({ query: "Dune", eventId }) };

function request(req) {
  const headers = { "x-appwrite-key": "test-key", "x-appwrite-client-ip": "192.0.2.10", ...req.headers };
  return handleRequest({
    req: { ...req, headers },
    res: { json: (body, status, headers) => ({ body, status, headers }), empty: () => ({ status: 204 }) },
    error: (message) => { throw new Error(message); },
  });
}

test("rejects malformed search events before making network requests", async (t) => {
  const createRow = t.mock.method(TablesDB.prototype, "createRow");
  assert.equal((await request({ ...search, bodyText: '{"query":"Dune"}' })).status, 400);
  assert.equal(createRow.mock.callCount(), 0);
});

test("validates catalog inputs and forwards only approved parameters to TMDB", async (t) => {
  const createRow = t.mock.method(TablesDB.prototype, "createRow", async () => ({ count: 1 }));
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url.origin, "https://api.themoviedb.org");
    assert.equal(url.pathname, "/3/discover/movie");
    assert.equal(url.searchParams.get("sort_by"), "vote_average.desc");
    assert.equal(url.searchParams.get("vote_count.gte"), "10000");
    assert.equal(url.searchParams.get("page"), "2");
    assert.equal(url.searchParams.has("api_key"), false);
    assert.equal(options.headers.authorization, "Bearer test-token");
    return Response.json({ page: 2, results: [{ id: 7 }] });
  });

  const catalog = { method: "GET", path: "/discover/movie" };
  assert.equal((await request({ ...catalog, query: { page: "501" } })).status, 400);
  assert.equal(createRow.mock.callCount(), 0);

  const response = await request({
    ...catalog,
    query: { page: "2", sort_by: "vote_average.desc", "vote_count.gte": "0", api_key: "ignored" },
  });
  assert.deepEqual(response, { status: 200, headers: undefined, body: { page: 2, results: [{ id: 7 }] } });
});

test("rejects requests beyond the per-IP limit before contacting TMDB", async (t) => {
  t.mock.method(TablesDB.prototype, "createRow", async () => {
    throw Object.assign(new Error("Already exists"), { code: 409 });
  });
  t.mock.method(TablesDB.prototype, "incrementRowColumn", async (params) => {
    assert.equal(params.tableId, "rate_limits");
    assert.equal(params.value, 1);
    return { count: 31 };
  });
  const fetch = t.mock.method(globalThis, "fetch");

  const response = await request(search);
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers["retry-after"]) > 0);
  assert.equal(fetch.mock.callCount(), 0);
});

test("returns the daily aggregate without exposing search phrases or arbitrary poster URLs", async (t) => {
  t.mock.method(TablesDB.prototype, "createRow", async () => ({ count: 1 }));
  t.mock.method(TablesDB.prototype, "listRows", async ({ tableId, queries }) => {
    assert.equal(tableId, "search_logs");
    assert.match(queries[0], /\$createdAt/);
    return { rows: [
      { movie_id: 7, searchTerm: "private text", poster_url: "https://image.tmdb.org/t/p/w500//movie.jpg" },
      { movie_id: 7, searchTerm: "another phrase" },
      { movie_id: 8, searchTerm: "third phrase", poster_url: "https://example.test/tracker.jpg" },
    ] };
  });

  const response = await request({ method: "GET", path: "/trends", query: { period: "daily" } });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.movies, [
    { $id: "daily-7", count: 2, movie_id: 7, poster_url: "https://image.tmdb.org/t/p/w500/movie.jpg" },
    { $id: "daily-8", count: 1, movie_id: 8, poster_url: null },
  ]);
});

test("omits raw phrases and their database IDs from the all-time aggregate", async (t) => {
  t.mock.method(TablesDB.prototype, "createRow", async () => ({ count: 1 }));
  t.mock.method(TablesDB.prototype, "listRows", async ({ tableId }) => {
    assert.equal(tableId, "metrics");
    return { rows: [{ $id: "internal-id", searchTerm: "private text", movie_id: 7, count: 28 }] };
  });

  const response = await request({ method: "GET", path: "/trends", query: { period: "all" } });
  assert.deepEqual(response.body.movies, [{ $id: "all-7-0", movie_id: 7, count: 28, poster_url: null }]);
});

test("validates the movie with TMDB and records each event exactly once", async (t) => {
  let saved = false;
  let commits = 0;
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(url.hostname, "api.themoviedb.org");
    assert.equal(url.searchParams.get("query"), "Dune");
    return Response.json({ results: [{ id: 42, poster_path: "/dune.jpg" }] });
  });
  t.mock.method(TablesDB.prototype, "createRow", async () => ({ count: 1 }));
  t.mock.method(TablesDB.prototype, "listRows", async ({ tableId }) => ({
    rows: tableId === "metrics" ? [{ $id: "existing-metric" }] : saved ? [{ $id: eventId }] : [],
  }));
  t.mock.method(TablesDB.prototype, "createTransaction", async ({ ttl }) => {
    assert.equal(ttl, 60);
    return { $id: "transaction" };
  });
  t.mock.method(TablesDB.prototype, "createOperations", async ({ transactionId, operations }) => {
    assert.equal(transactionId, "transaction");
    assert.deepEqual(operations, [
      {
        databaseId: "stats", tableId: "search_logs", action: "create", rowId: eventId,
        data: { searchTerm: "Dune", movie_id: 42, poster_url: "https://image.tmdb.org/t/p/w500/dune.jpg" },
      },
      {
        databaseId: "stats", tableId: "metrics", action: "increment", rowId: "existing-metric",
        data: { column: "count", value: 1 },
      },
    ]);
  });
  t.mock.method(TablesDB.prototype, "updateTransaction", async ({ commit }) => {
    assert.equal(commit, true);
    saved = true;
    commits += 1;
  });

  const forgedBody = JSON.stringify({ query: "Dune", eventId, movie_id: 9001 });
  assert.equal((await request({ ...search, bodyText: forgedBody })).status, 204);
  assert.equal((await request(search)).status, 204);
  assert.equal(commits, 1);
});
