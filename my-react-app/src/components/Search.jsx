
const Search = ({searchTerm, setSearchTerm}) => { // И не нужно писать props! Но и дочерний компонент searchTerm нельзя изменять т.к. он доступен только для чтения и может менять его значения в разных местах

    return (
        <div className='search'>
            <div>
                <img src="./search.svg" alt="Search" />
                <input  type="text" 
                        placeholder='Search through thousands of movies'
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}/> {/* Обработчик изменения */}
            </div>
        </div>
    )
}

export default Search