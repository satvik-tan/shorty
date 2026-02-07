import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import RedirectPage from './pages/RedirectPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route wrapper
function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

// Home wrapper to handle 404 redirects
function HomeWrapper() {
  const [searchParams] = useSearchParams();
  if (searchParams.get('notfound') || searchParams.get('error')) {
    return <NotFoundPage />;
  }
  return <HomePage />;
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomeWrapper />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      {/* Redirect route - must be last to catch all shortCodes */}
      <Route path="/:shortCode" element={<RedirectPage />} />
    </Routes>
  );
}

export default App;
