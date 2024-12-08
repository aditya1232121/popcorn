import { useState, useEffect } from "react";
import Starrating from './starrating' ;

const average = (arr) => (arr.length ? arr.reduce((acc, cur) => acc + cur, 0) / arr.length : 0);

const KEY = "fa908728";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("interstellar");
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleSelectMovie = (id) => {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  };

  const handleClose = () => {
    setSelectedId(null);
  };

  function handleAddWatched(movie) {
    setWatched((watched) => {
      // Check if the movie is already in the watched list
      const isAlreadyWatched = watched.some((watchedMovie) => watchedMovie.imdbID === movie.imdbID);
      if (isAlreadyWatched) return watched; // If it exists, return the current state
      return [...watched, movie]; // Else, add the movie
    });
  }

  function handleRemoveWatched(imdbID) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== imdbID));
  }

  // Fetch movies when the component mounts or when query changes
  useEffect(() => {
    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError(false); // Reset error before fetching

        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`);

        if (!res.ok) throw new Error("Something went wrong with the request");

        const data = await res.json();

        // Check if the API responded with 'False' for no results
        if (data.Response === "False") throw new Error("Movies not found");

        setMovies(data.Search || []);
      } catch (err) {
        console.error(err.message);
        setError(err.message); // Set the error message
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, [query]);

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <Numresult movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading ? <p>Loading...</p> : error ? <p>{error}</p> : <Movielist movies={movies} onSelectMovie={handleSelectMovie} />}
        </Box>
        <Box>
          {selectedId ? (
            <Moviedetails 
              selectedId={selectedId} 
              onClose={handleClose}
              onAddWatched={handleAddWatched}
            />
          ) : (
            <>
              <Watchedsummary watched={watched} />
              <Watchedlist watched={watched} onRemoveWatched={handleRemoveWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Navbar({ children }) {
  return <nav className="nav-bar"><Logo />{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img" aria-label="popcorn">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Numresult({ movies }) {
  return <p className="num-results">Found <strong>{movies.length}</strong> results</p>;
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Movielist({ movies, onSelectMovie }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} 
          onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Moviedetails({ selectedId, onClose , onAddWatched }) {
  const [movie, setMovie] = useState({});
  const [isLoading , setIsLoading] = useState(false ) ;
  const [userRating, setUserRating] = useState('');

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
      userRating: Number(userRating)
    };
    onAddWatched(newMovie);
    onClose() ;
  }

  useEffect(function() {
    document.addEventListener("keydown" , function(e) {
      if(e.code === "Escape" ) {
onClose () ;
      }
    }) ;
  } , [onClose]) ;
  useEffect(() => {
    async function getMovieDetails() {
      try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
        const data = await res.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    }

    getMovieDetails();
  }, [selectedId]);

  useEffect(function() {
document.title = `Movie | ${title}` ;
  } , [title])

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onClose}>&larr;</button>
        <img src={poster} alt={`Poster of ${title}`} />
        <div className="details-overview">
          <h2>{title || "Unknown Title"}</h2>
          <p>{released || "Unknown Date"} &bull; {runtime || "Unknown Runtime"}</p>
          <p>{genre || "Unknown Genre"}</p>
          <p><span>⭐</span> {imdbRating || "N/A"} IMDb rating</p>
        </div>
      </header>
      <section>
        <div className="rating">
          <Starrating maxRating={10} size={24} setRating={setUserRating} />
          <button className="btn-add" onClick={handleAdd}>
            + Add to list
          </button>
        </div>
        <p><em>{plot || "No plot available"}</em></p>
        <p>Starring: {actors || "Unknown actors"}</p>
        <p>Directed by: {director || "Unknown director"}</p>
      </section>
    </div>
  );
}

function Watchedsummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p><span>#️⃣</span><span>{watched.length} movies</span></p>
        <p><span>⭐️</span><span>{avgImdbRating.toFixed(2)}</span></p>
        <p><span>🌟</span><span>{avgUserRating.toFixed(2)}</span></p>
        <p><span>⏳</span><span>{avgRuntime} min</span></p>
      </div>
    </div>
  );
}

function Watchedlist({ watched, onRemoveWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onRemoveWatched={onRemoveWatched} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onRemoveWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p><span>⭐️</span><span>{movie.imdbRating}</span></p>
        <p><span>🌟</span><span>{movie.userRating}</span></p>
        <p><span>⏳</span><span>{movie.runtime} min</span></p>
        <button onClick={() => onRemoveWatched(movie.imdbID)} className="btn-remove">
          Remove
        </button>
      </div>
    </li>
  );
}
