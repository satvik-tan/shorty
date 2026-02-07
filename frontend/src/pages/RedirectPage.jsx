import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function RedirectPage() {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Immediately redirect to backend - it will handle the 302 redirect
    // or redirect back to frontend with error params
    window.location.href = `${API_URL}/${shortCode}`;
  }, [shortCode]);

  // Show loading state while redirecting
  return (
    <div className="redirect-loading">
      <div className="spinner"></div>
      <p>Redirecting...</p>
    </div>
  );
}

export default RedirectPage;
