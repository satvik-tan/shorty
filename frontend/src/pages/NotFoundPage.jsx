import { Link, useSearchParams } from 'react-router-dom';

function NotFoundPage() {
  const [searchParams] = useSearchParams();
  const notfound = searchParams.get('notfound');
  const error = searchParams.get('error');

  let message = 'The page you are looking for does not exist.';
  if (notfound) {
    message = `The short link "${notfound}" was not found or has been deactivated.`;
  } else if (error) {
    message = 'An error occurred while processing your request.';
  }

  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Not Found</h2>
        <p>{message}</p>
        <Link to="/" className="btn-primary">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
