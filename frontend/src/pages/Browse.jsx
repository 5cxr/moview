import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import MovieCard from '../components/MovieCard.jsx';
import MovieForm from '../components/MovieForm.jsx';

export default function Browse() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMovies(search);
  }, [search]);

  async function loadMovies(searchTerm) {
    const { data } = await api.get('/movies', { params: searchTerm ? { search: searchTerm } : {} });
    setMovies(data);
  }

  async function handleCreate(movie) {
    await api.post('/movies', movie);
    setShowForm(false);
    loadMovies(search);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Browse movies</h2>
        {user && <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : 'Add movie'}</button>}
      </div>

      <input
        className="search-box"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {showForm && <MovieForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      <div className="movie-grid">
        {movies.map((m) => (
          <MovieCard key={m.movieId} movie={m} />
        ))}
        {movies.length === 0 && <p>No movies yet.</p>}
      </div>
    </div>
  );
}
