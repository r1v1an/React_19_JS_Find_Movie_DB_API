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
      <BackToTop />
    </MovieProvider>
  );
};

export default App;
