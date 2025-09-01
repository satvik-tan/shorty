import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

function HomePage() {
  return (
    <main className="hero">
      <h2>Shorten your URLs instantly</h2>
      <p>Create short, memorable links in seconds</p>
      
      <SignedOut>
        <div className="cta-buttons">
          <Link to="/sign-up" className="btn-primary">Get Started</Link>
          <Link to="/sign-in" className="btn-secondary">Sign In</Link>
        </div>
      </SignedOut>
      
      <SignedIn>
        <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
      </SignedIn>
    </main>
  );
}

export default HomePage;
