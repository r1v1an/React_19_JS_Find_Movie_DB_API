const Card = ({title, rating, isCool, actors}) => {
  return(
    <div>
      <h2>{title} {rating} {isCool ? "Cool" : "terrible"}</h2>
    </div>
  )
}


const App = () => {

    return (
      <>
      <h2>Functional Arrow Component</h2>
      <Card title="Star Wars" rating={5} isCool={true} actors={[{name:'R2D2'}]}/>
      <Card title="Avatat" rating={4} isCool={false} actors={[{name:'Blueman'}]}/>
      <Card title="Lion king" rating={3} isCool={true} actors={[{name:'Simba'}]}/>
      </>
    )
}

export default App
