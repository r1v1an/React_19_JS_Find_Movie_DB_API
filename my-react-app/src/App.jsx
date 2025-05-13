const Card = ({title}) => {
  return(
    <div style={{
      border: '1px solid white',
      padding: '20px',
      margin: '10px',
      backgroundColor: '#31363f',
      borderRadius: '10px',
      minHeight: '100px'
    }}>
      <h2>{title}</h2>
    </div>
  )
}


const App = () => {

    return (
      <div className="card-container">
        <h2>Functional Arrow Component</h2>
        <Card title="Star Wars" rating={5} isCool={true}/>
        <Card title="Avatat"/>
        <Card title="Lion king"/>
      </div>
    )
}

export default App
