import { useState } from 'react';

const emptyForm = { title: '', genre: '', releaseYear: '', director: '' };

export default function MovieForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ?? emptyForm);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({ ...form, releaseYear: form.releaseYear ? Number(form.releaseYear) : null });
    } catch (err) {
      setError(err.response?.data?.message ?? 'something went wrong');
    }
  }

  return (
    <form className="movie-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <label>
        Title
        <input value={form.title} onChange={(e) => update('title', e.target.value)} required />
      </label>

      <label>
        Genre
        <input value={form.genre ?? ''} onChange={(e) => update('genre', e.target.value)} />
      </label>

      <label>
        Release year
        <input type="number" value={form.releaseYear ?? ''} onChange={(e) => update('releaseYear', e.target.value)} />
      </label>

      <label>
        Director
        <input value={form.director ?? ''} onChange={(e) => update('director', e.target.value)} />
      </label>

      <div className="form-actions">
        <button type="submit">Save movie</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
