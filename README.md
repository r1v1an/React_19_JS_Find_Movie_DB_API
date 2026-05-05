# Find Movies App

> Проект представляет собой React SPA для поиска и отслеживания фильмов на основе TMDB API и облачной базы данных Appwrite.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)
![Appwrite](https://img.shields.io/badge/Appwrite-BaaS-F02E65?logo=appwrite&logoColor=white&style=flat-square)

---

## Скриншоты интерфейса

**Главная страница**
![Главная страница](./screenshots/home.png)

**Карточки фильмов**
![Карточки фильмов](./screenshots/movieCards.png)

**Результаты поиска**
![Результаты поиска](./screenshots/searchResults.png)

**Избранное**
![Избранное](./screenshots/favorites.png)

**Созданные атрибуты для хранения в Appwrite (BaaS)**
![Созданные атрибуты для хранения в Appwrite (BaaS)](./screenshots/appwritePanel.png)

**Собранная статистика поисковых запросов в Appwrite**
![Собранная статистика поисковых запросов в Appwrite](./screenshots/appwriteDB.png)

---

## О проекте

**Find Movies App** - это одностраничное приложение (SPA) на React 19, которое позволяет просматривать, искать и сохранять любимые фильмы. Приложение интегрируется с двумя внешними сервисами: **TMDB API** - для получения данных о фильмах, и **Appwrite** как Backend as a Service (BaaS) для хранения статистики поисковых запросов.

Проект создан с целью отработки реальных паттернов фронтенд-разработки: интеграция с REST API, глобальное управление состоянием, постоянное хранилище данных и оптимизация производительности.

---

## Реализованный функционал

- **Поиск фильмов** - поисковый запрос в реальном времени передаётся в TMDB API
- **Debounce (отложенный запрос)** - запрос к API отправляется только через 1 секунду после остановки ввода, снижая нагрузку на сеть
- **Адаптивная сетка карточек** - отображение постера, рейтинга, языка производства и года выпуска
- **Избранное (Favorites)** - добавление/удаление фильмов, список сохраняется в `localStorage` и не сбрасывается при перезагрузке страницы
- **Улучшенный UX карточек** - активная кнопка добавления в избранное (❤️) отображается всегда, а неактивная (🤍) появляется при наведении (Tailwind `group`)
- **Трендовые фильмы** - Топ-10 самых популярных поисковых запросов, данные хранятся в облачной базе данных Appwrite и обновляются в реальном времени
- **Плавная бегущая строка (Ticker)** - блок трендовых фильмов автоматически прокручивается как бесконечная лента на всю ширину экрана с остановкой при наведении
- **Состояния загрузки и ошибок** - спиннер во время запроса и понятные сообщения об ошибках
- **Безопасность** - все API-ключи хранятся в переменных окружения (`.env`), не попадают в исходный код

---

## Технологический стек

- **React 19**
- **Vite 6**
- **JavaScript ES6+**
- **React Router DOM v7**
- **React Context API**
- **Tailwind CSS v4**
- **TMDB API**
- **Appwrite (BaaS)**
- **react-use**
- **localStorage**

---

## Установка и запуск

### Требования

- [Node.js](https://nodejs.org/) v18+
- [TMDB API ключ](https://developer.themoviedb.org/reference/getting-started) (бесплатная регистрация)
- Проект в [Appwrite](https://appwrite.io/) с настроенной базой данных и коллекцией

### 1. Клонировать репозиторий

```bash
git clone https://github.com/r1v1an/React_19_JS_Find_Movie_DB_API.git
cd React_19_JS_Find_Movie_DB_API
```

### 2. Установить зависимости

```bash
npm install

```

### 3. Настроить переменные окружения

Создай файл `.env.local` в корне проекта:

```env
VITE_TMDB_API_KEY=YOUR_tmdb_bearer_token
VITE_APPWRITE_PROJECT_ID=YOUR_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=YOUR_appwrite_database_id
VITE_APPWRITE_COLLECTION_ID=YOUR_appwrite_collection_id
```

> ⚠️ Никогда не коммить `.env.local` в репозиторий. Он уже добавлен в `.gitignore`.

### 4. Запустить дев-сервер

```bash
npm run dev
```

Приложение будет доступно по адресу **http://localhost:3000**

---

## Схема коллекции Appwrite

Для работы функции «Трендовые фильмы» создай коллекцию в Appwrite со следующими атрибутами:

| Атрибут | Тип | Required | Special properties |
|---|---|---|---|
| `searchTerm` | String | ✅ | Size: 1000 |
| `count` | Integer | ❌ | Min: -9.22e+18, Max: 9.22e+18 |
| `movie_id` | Integer | ✅ | Min: -9.22e+18, Max: 9.22e+18 |
| `poster_url` | String | ✅ | нет |

---

## Ключевые технические решения

- **Паттерн Debounce** — предотвращает спам API-запросами при каждом нажатии клавиши; запрос отправляется только после 1 секунды паузы в вводе
- **Context API + localStorage** — состояние избранного доступно во всех компонентах и сохраняется после перезагрузки страницы
- **Решение проблемы React StrictMode** — использован флаг `useRef` для предотвращения двойного срабатывания `useEffect` в режиме разработки, который мог бы затирать `localStorage`
- **Разделение ответственности (Separation of Concerns)** — вся логика работы с API вынесена в `/services`, компоненты остаются чистыми
- **Условный рендеринг** — корректная обработка состояний загрузки, ошибок и пустых результатов
- **Защита от null** — обработка отсутствующих постеров, рейтингов и дат без падения приложения
- **CSS-анимации вместо JS-скролла** — бесконечная лента трендов реализована с помощью `@keyframes` и дублирования элементов, что обеспечивает плавные 60fps без нагрузки на основной поток JavaScript
- **Продвинутое использование Tailwind CSS** — применение механизмов `group` и `group-hover` для сложного управления видимостью элементов (кнопки лайка) без написания дополнительного JS-кода или кастомного CSS

---

## Контакты

Если есть вопросы или хотите сотрудничать — пишите!

AinurSirazhev@gmail.com