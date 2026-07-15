
interface SearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const Search = ({searchTerm, setSearchTerm}: SearchProps) => { // И не нужно писать props! Но и дочерний компонент searchTerm нельзя изменять т.к. он доступен только для чтения и может менять его значения в разных местах

    return (
        <div className='search mt-0 pt-0 pb-0'>
            <div>
                <img src="./search.svg" alt="Search" />
                <input  className='pt-3 pb-3'
                        name="Search placeholder"
                        type="text" 
                        placeholder='Search through thousands of movies'
                        value={searchTerm}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}/> {/* Обработчик изменения */}
            </div>
        </div>
    )
}

export default Search