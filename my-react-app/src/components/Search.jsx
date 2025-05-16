import React from 'react'

const person = {
    name: 'Bruce Wayne',
    age: 36,
    location: 'Gotham City'
}

const {name, age, location} = person; // Можно деструктуировать объекты для упрощенного дальнейшего использования

console.log(name); // Bruce Wayne

const Search = (props) => {
    return (
        <div className='text-white text-3xl'>{props.searchTerm}</div>
    )
}

export default Search