
const Spinner = () => {
    return (
        <div role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.6C100 78.2 77.6 100.6 50 100.6S0 78.2 0 50.6 22.4 0.6 50 0.6 100 22.9 100 50.6ZM9.1 50.6C9.1 73.2 27.4 91.5 50 91.5s40.9-18.3 40.9-40.9S72.6 9.7 50 9.7 9.1 28 9.1 50.6Z" fill="currentColor"/>
                <path d="M94 39C96.4 38.4 97.9 35.9 97 33.6 95.3 28.8 92.9 24.4 89.8 20.3 85.8 15.1 80.9 10.7 75.2 7.4 69.5 4.1 63.3 1.9 56.8 1 51.8 0.4 46.7 0.4 41.7 1.3 39.3 1.7 37.8 4.2 38.5 6.6S41.6 10.5 44 10.1C47.9 9.5 51.7 9.5 55.5 10 60.9 10.8 66 12.5 70.6 15.3S79.3 21.6 82.6 25.8C84.9 28.9 86.8 32.3 88.2 35.9 89.1 38.2 91.5 39.7 94 39Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
    )
}

export default Spinner