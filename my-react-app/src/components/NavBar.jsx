import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="navbar text-white fixed top-0 left-0 w-full z-50 backdrop-blur-sm shadow-sm">
      <div className="container flex m-auto justify-between items-center h-16">
        <div className="navbar-brand">
          <Link to="/">Movie App</Link>
        </div>
        <div className="navbar-links ">
          <Link to="/" className="nav-link mr-10">
            Home
          </Link>
          <Link to="/favorites" className="nav-link">
            Favorites
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
