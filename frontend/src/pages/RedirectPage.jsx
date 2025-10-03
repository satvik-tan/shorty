import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function RedirectPage() {
  const { shortCode } = useParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const redirect = async () => {
      try {
        // Call backend API to get the long URL
        const res = await fetch(`${API_URL}/${shortCode}`);
        
        if (!isMounted) return;
        
        if (!res.ok) {
          setError('Short URL not found or has been deactivated.');
          setLoading(false);
          return;
        }

        // Parse JSON response
        const data = await res.json();
        
        if (!isMounted) return;
        
        if (data.success && data.longUrl) {
          // Redirect to the long URL
          window.location.href = data.longUrl;
        } else {
          setError('Invalid short URL.');
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Redirect error:', err);
        setError('Failed to redirect. Please try again.');
        setLoading(false);
      }
    };

    // Set timeout to show 404 after 10 seconds if still loading
    const timeout = setTimeout(() => {
      if (isMounted) {
        setError('Short URL not found or took too long to respond.');
        setLoading(false);
      }
    }, 10000);

    redirect();

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [shortCode]);

  if (error) {
    return (
      <div className="redirect-error">
        <h2>404 - Link Not Found</h2>
        <p>{error}</p>
        <a href="/">Go to Home</a>
      </div>
    );
  }

  return (
    <div className="redirect-loading">
      <div className="spinner"></div>
      <p>Redirecting...</p>
    </div>
  );
}

export default RedirectPage;
