import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="navbar text-white fixed top-0 left-0 w-full z-20 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
      <div className="container flex px-5 py-12 xs:p-10 max-w-7xl mx-auto justify-between items-center h-16">
        <div className="navbar-brand">
          <Link to="/Home">Find Movies App</Link>
        </div>
        <div className="navbar-links ">
          <Link to="/favorites" className="nav-link">
            Favorites
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
