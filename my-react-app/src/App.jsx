import { useState } from "react";

const Card = ({ title }) => {

  const [hasLiked, setHasLiked] = useState(false); // Хук деструктуирует массив[логическая переменная, функция обновления состояния этой переменной]

  return (
    <div className="card">
      <h2>{title}</h2>

      <button onClick={() => setHasLiked(!hasLiked)}> {/* Переключение состояния через отрицание !переменной */}
        {hasLiked ? '❤️' : '🤍'}
      </button>
    </div>
  );
};

const App = () => {

  return (
    <div className="card-container">
      <Card title="Star Wars" rating={5} isCool={true} />
      <Card title="Avatar" />
      <Card title="The Lion king" />
    </div>
  );
};

export default App;
