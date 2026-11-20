import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import BackToTop from "./components/BackToTop";
import { MovieProvider } from "./contexts/MovieContext";


const App = () => {

  return (
    // div заменяем на MovieProvider
    <MovieProvider> 
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/Home" />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
      <footer aria-label="Credits" className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-6 text-xs text-gray-300">
        <a href="https://www.themoviedb.org/">
          <img src={`${import.meta.env.BASE_URL}tmdb-logo.svg`} alt="The Movie Database" className="w-12" />
        </a>
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        <p>
          <a className="underline" href="https://commons.wikimedia.org/wiki/File:Tmdb.new.logo.svg">Logo by Travis Bell</a>
          {" · "}
          <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
        </p>
      </footer>
      <BackToTop />
    </MovieProvider>
  );
};

export default App;
