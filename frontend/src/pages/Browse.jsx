import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import MovieCard from '../components/MovieCard.jsx';

export default function Browse() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMovies(search);
  }, [search]);

  async function loadMovies(searchTerm) {
    const { data } = await api.get('/movies', { params: searchTerm ? { search: searchTerm } : {} });
    setMovies(data);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Browse movies</h2>
      </div>

      <input
        className="search-box"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="movie-grid">
        {movies.map((m) => (
          <MovieCard key={m.movieId} movie={m} />
        ))}
        {movies.length === 0 && <p className="empty-state">No movies yet.</p>}
      </div>
    </div>
  );
}
