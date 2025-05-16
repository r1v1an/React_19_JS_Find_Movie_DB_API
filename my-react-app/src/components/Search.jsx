import React from 'react'

const person = {
    name: 'Bruce Wayne',
    age: 36,
    location: 'Gotham City'
}

console.log(name);

const Search = (props) => {
    return (
        <div className='text-white text-3xl'>{props.searchTerm}</div>
    )
}

export default Search