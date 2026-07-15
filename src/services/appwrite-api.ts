import { Client, Databases, ID, Query } from 'appwrite'
import type { Movie, TrendingMovie } from '../types'

const PROJECT_ID: string = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID: string = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID: string = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const COLLECTION_LOGS_ID: string = import.meta.env.VITE_APPWRITE_COLLECTION_LOGS_ID;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm: string, movie: Movie): Promise<void> => {
    // 1. Use Appwrite SDK to check if the search term exists in the database
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('searchTerm', searchTerm),])
        // 2. If it does, update the count
        if (result.documents.length > 0) {
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            })
            // 3. If it doesn't, create a new document with the search term and count as 1            
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
            })
        }
    } catch (error) {
        console.error(error);
    }
}

// Параметры не нужны при извлечении из БД appwrite
export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(10), // Ограничение до 10
            Query.orderDesc("count") // Сортировка по убыванию кол-ва просмотров
        ])

        return result.documents as unknown as TrendingMovie[];

    } catch (error) {
        console.error(error);
        return []
    }
}

/**
 * Логирует каждый поисковый запрос в коллекцию search_logs
 * для последующей агрегации "за 24 часа".
 */
export const logSearchTerm = async (searchTerm: string, movie: Movie): Promise<void> => {
    try {
        await database.createDocument(DATABASE_ID, COLLECTION_LOGS_ID, ID.unique(), {
            searchTerm,
            movie_id: movie.id,
            poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
        })
    } catch (error) {
        console.error('Error logging search term:', error);
    }
}

/**
 * Возвращает топ-10 фильмов за последние 24 часа
 * на основе коллекции search_logs.
 * Группировка по movie_id — один фильм = одна позиция в топе.
 */
export const getDailyTrendingMovies = async (): Promise<TrendingMovie[]> => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const result = await database.listDocuments(DATABASE_ID, COLLECTION_LOGS_ID, [
            Query.greaterThan('$createdAt', twentyFourHoursAgo),
            Query.limit(500),
            Query.orderDesc('$createdAt'),
        ])

        // Группируем по movie_id, считаем частоту
        // Для отображения берём самый частый searchTerm
        const grouped = new Map<number, { count: number; searchTerm: string; termCounts: Map<string, number>; poster_url: string; title?: string }>()

        for (const doc of result.documents) {
            const movieId = doc.movie_id as number;
            const term = doc.searchTerm as string;
            let entry = grouped.get(movieId);
            if (entry) {
                entry.count += 1;
                entry.termCounts.set(term, (entry.termCounts.get(term) || 0) + 1);
            } else {
                const termCounts = new Map<string, number>();
                termCounts.set(term, 1);
                grouped.set(movieId, {
                    count: 1,
                    searchTerm: term,
                    termCounts,
                    poster_url: doc.poster_url as string,
                    title: doc.title as string | undefined,
                });
            }
        }

        // Для каждого фильма выбираем самый частый searchTerm
        for (const entry of grouped.values()) {
            let bestTerm = '';
            let bestCount = 0;
            for (const [term, cnt] of entry.termCounts) {
                if (cnt > bestCount) {
                    bestCount = cnt;
                    bestTerm = term;
                }
            }
            entry.searchTerm = bestTerm;
            delete (entry as any).termCounts;
        }

        // Сортируем по убыванию count и берём топ-10
        const sorted = Array.from(grouped.entries())
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 10)

        // Преобразуем в TrendingMovie[]
        return sorted.map(([movie_id, data], index) => ({
            $id: `daily-${index}`,
            searchTerm: data.searchTerm,
            count: data.count,
            movie_id,
            poster_url: data.poster_url,
            title: data.title,
        }))

    } catch (error) {
        console.error('Error fetching daily trending movies:', error);
        return []
    }
}
