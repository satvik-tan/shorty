import { Outlet, Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

function Layout() {
  return (
    <div className="app">
      <header>
        <Link to="/" className="logo">
          <h1>🔗 URL Shortener</h1>
        </Link>
        <nav>
          <SignedIn>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link to="/sign-in" className="btn-primary">Sign In</Link>
          </SignedOut>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

export default Layout;
