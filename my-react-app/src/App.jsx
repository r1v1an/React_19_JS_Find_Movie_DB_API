import { useEffect, useState } from "react";

const Card = ({ title }) => {

  const [count, setCount] = useState(0);

  const [hasLiked, setHasLiked] = useState(false); // Хук деструктуирует массив[логическая переменная, функция обновления состояния этой переменной]

  useEffect(() => {
    console.log(`${title} has been liked: ${hasLiked}`);
  }, [hasLiked]); // 2й параметр массива зависимостей "глубина" - проверяет изменение установленных параметров через ,

  useEffect(() => {
    console.log(`CARD RENDERED`);
  }, []); // Разовый рендер при монтировании

  return (
    <div className="card" onClick={() => setCount(count + 1)}> {/* Не рекомендуется использовать само состояние count - используйте 1ую букву c */}
      <h2>{title} <br /> {count}</h2>

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
