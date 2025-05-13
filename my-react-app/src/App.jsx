const Card = ({title, rating, isCool}) => {
  return(
    <div style={{
      border: '1px solid white',
      padding: '20px',
      margin: '10px',
      backgroundColor: '#31363f',
      borderRadius: '10px',
      minHeight: '100px'
    }}>
      <h2>{title} {rating} {isCool ? "Cool" : "terrible"}</h2>
    </div>
  )
}


const App = () => {

    return (
      <div className="card-container">
        <h2>Functional Arrow Component</h2>
        <Card title="Star Wars" rating={5} isCool={true}/>
        <Card title="Avatat" rating={4} isCool={false}/>
        <Card title="Lion king" rating={3} isCool={true}/>
      </div>
    )
}

export default App
