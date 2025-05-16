import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => { // И не нужно писать props! Но и дочерний компонент searchTerm нельзя изменять т.к. он доступен только для чтения и может менять его значения в разных местах

    searchTerm='I AM BATMAN NOT!' // НЕЛЬЗЯ ТАК ДЕЛАТЬ

    return (
        <div className='text-white text-3xl'>{searchTerm}</div>
    )
}

export default Search