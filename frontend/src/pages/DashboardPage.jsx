import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function DashboardPage() {
  const { getToken } = useAuth();
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/urls`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.error('Server error:', res.status, await res.text());
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setUrls(data.data);
      }
    } catch (err) {
      console.error('Error fetching URLs:', err);
    }
  };

  const createShortUrl = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ longUrl }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Server error:', res.status, text);
        setError(`Server error: ${res.status}`);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setShortUrl(data.data.shortUrl);
        setLongUrl('');
        fetchUrls();
      } else {
        setError(data.error || 'Failed to create short URL');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/urls/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchUrls();
      }
    } catch (err) {
      console.error('Error toggling URL:', err);
    }
  };

  const startEdit = (url) => {
    setEditingId(url.id);
    setEditUrl(url.longUrl);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditUrl('');
  };

  const saveEdit = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/urls/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ longUrl: editUrl }),
      });

      if (res.ok) {
        setEditingId(null);
        setEditUrl('');
        fetchUrls();
      }
    } catch (err) {
      console.error('Error updating URL:', err);
    }
  };

  return (
    <main className="dashboard">
      <h2>Create Short URL</h2>

      <form onSubmit={createShortUrl} className="url-form">
        <input
          type="url"
          placeholder="Enter your long URL..."
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Shorten'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {shortUrl && (
        <div className="result">
          <p>✅ Short URL created:</p>
          <div className="result-url">
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
            <button onClick={() => copyToClipboard(shortUrl)} className="btn-copy">
              Copy
            </button>
          </div>
        </div>
      )}

      <section className="urls-section">
        <h3>Your URLs ({urls.length})</h3>
        <div className="urls-list">
          {urls.length === 0 ? (
            <p className="no-urls">No URLs created yet. Create your first one above!</p>
          ) : (
            urls.map((url) => (
              <div key={url.id} className={`url-item ${!url.isActive ? 'inactive' : ''}`}>
                <div className="url-info">
                  <strong>{url.shortCode}</strong>
                  {editingId === url.id ? (
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <p className="long-url">{url.longUrl}</p>
                  )}
                  {!url.isActive && <span className="inactive-badge">Inactive</span>}
                </div>
                <div className="url-stats">
                  <span className="clicks">{url.totalClicks} clicks</span>
                  {editingId === url.id ? (
                    <>
                      <button onClick={() => saveEdit(url.id)} className="btn-save">
                        Save
                      </button>
                      <button onClick={cancelEdit} className="btn-cancel">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => copyToClipboard(`${API_URL}/${url.shortCode}`)}
                        className="btn-copy-small"
                      >
                        Copy
                      </button>
                      <button onClick={() => startEdit(url)} className="btn-edit">
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(url.id, url.isActive)}
                        className={url.isActive ? 'btn-deactivate' : 'btn-activate'}
                      >
                        {url.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
