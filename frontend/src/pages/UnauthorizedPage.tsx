import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
      <Link to="/">Go to Dashboard</Link>
    </div>
  );
}