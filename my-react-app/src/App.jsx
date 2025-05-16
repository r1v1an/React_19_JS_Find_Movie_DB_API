import React, { useState } from "react";
import Search from "./components/Search";

const App = () => {
  const [searchTerm, setSearchTerm] = useState('I AM BATMAN');


  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./public/hero-img.png" alt="Hero Banner"/>
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
        </header>

        <Search searchTerm={searchTerm} setSeacrhTerm={setSearchTerm}/>
      </div>

    </main>
  );
};

export default App;
