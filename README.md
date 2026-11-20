# Find Movies App

Find Movies App — пет-проект на React 19 для поиска фильмов и ведения списка избранного. Каталог и постеры загружаются из TMDB, избранное хранится в браузере, а статистика поиска — в Appwrite.

![Главная страница Find Movies App](./screenshots/home.png)

## Что умеет приложение

- Показывает популярные фильмы TMDB и ищет по названию. Запрос отправляется через секунду после окончания ввода.
- Подгружает следующие страницы каталога и результатов поиска при прокрутке.
- Показывает постер, рейтинг, язык оригинала и год выпуска фильма.
- Сохраняет фильмы на отдельной странице Favorites через React Context и `localStorage`.
- Показывает топ-10 поисковых запросов в прокручиваемой ленте. Appwrite хранит счётчик запроса и данные первого найденного фильма.

Скриншоты [карточек](./screenshots/movieCards.png), [результатов поиска](./screenshots/searchResults.png) и [избранного](./screenshots/favorites.png).

## Стек и ветки

`master` использует JavaScript, React 19, React Router 7, Vite 6, Tailwind CSS 4 и Appwrite SDK 18.

В ветке [`DEV`](https://github.com/r1v1an/React_19_JS_Find_Movie_DB_API/tree/DEV) приложение переведено на TypeScript. Там добавлены сортировка каталога (`Popular`, `Top Rated`, `Newest`), модальное окно с описанием, жанрами и длительностью фильма, а также переключение трендов за всё время и за последние 24 часа.

## Локальный запуск

Инструкция рассчитана на `master`. Для запуска нужны Node.js 20 или новее, токен **API Read Access Token** от TMDB и проект Appwrite Cloud. [Документация TMDB](https://developer.themoviedb.org/reference/getting-started) · [Appwrite для веб-приложений](https://appwrite.io/docs/quick-starts/web).

```bash
git clone -b master https://github.com/r1v1an/React_19_JS_Find_Movie_DB_API.git
cd React_19_JS_Find_Movie_DB_API
npm ci
```

Создайте в корне проекта файл `.env.local` и заполните значения для своей конфигурации.

```dotenv
VITE_TMDB_API_KEY=your_tmdb_read_access_token
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
```

Vite подставляет значения `VITE_*` в клиентскую сборку, где они доступны через браузер. Храните локальный `.env.local` вне Git, а токены, которые должны оставаться закрытыми при публикации, — на сервере. [Документация Vite](https://vite.dev/guide/env-and-mode.html#env-variables).

```bash
npm run dev
```

Откройте [localhost:3000](http://localhost:3000/). Для проверки production-сборки выполните `npm run build`, затем `npm run preview`.

### Appwrite

В Appwrite добавьте платформу **Web** с именем хоста `localhost` и создайте коллекцию для статистики поиска. Клиент в [сервисе Appwrite](./src/services/appwrite-api.js) настроен на регион Frankfurt (`fra`). Если ваш проект размещён в другом регионе, укажите его endpoint в этом сервисе.

| Атрибут | Тип | Обязательный | Назначение |
| --- | --- | --- | --- |
| `searchTerm` | String (1000) | Да | Поисковый запрос |
| `count` | Integer | Нет | Счётчик запросов. При создании приложение записывает `1` |
| `movie_id` | Integer | Да | ID первого фильма в результатах TMDB |
| `poster_url` | String | Да | URL постера |

Для локальной демонстрации с отдельной тестовой коллекцией приложению нужны права `Read`, `Create` и `Update` для посетителей без входа в аккаунт. [Схема коллекции](./screenshots/appwritePanel.png) · [Пример данных](./screenshots/appwriteDB.png).

## Контакты

AinurSirazhev@gmail.com
