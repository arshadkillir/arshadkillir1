import React, { useState, useEffect } from 'react';
import API from '@/services/api.js';
import { useAuth } from '../context/AuthContext.jsx'; // Import useAuth
import styles from './RegisterUser.module.css';

export default function RegisterUser() {
  const { user } = useAuth(); // Get current user from AuthContext

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STAFF'); // Default role
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Role-based access control
    if (user.role !== 'OWNER' && user.role !== 'SUPERADMIN') {
      setError('You do not have permission to register new users.');
      setInitialLoading(false);
      return;
    }

    // Fetch outlets for the admin to choose from
    const fetchOutlets = async () => {
      try {
        const response = await API.get('/outlets');
        setOutlets(response.data);
      } catch (err) {
        setError('Failed to load outlets. Please refresh the page.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchOutlets();
  }, [user]);

  // Clear outlet selection if the role is changed to one that doesn't need it
  useEffect(() => {
    if (role === 'OWNER') {
      setSelectedOutlet('');
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      await API.post('/auth/register', {
        name,
        email,
        password,
        role,
        tenantId: user.tenantId, // Assign to the same tenant
        outletId: selectedOutlet || null, // Assign to the selected outlet
      });
      setSuccess(`User "${name}" created successfully!`);
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setRole('STAFF');
      setSelectedOutlet('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const needsOutlet = role === 'STAFF' || role === 'MANAGER';
  const canSubmit = !((needsOutlet && !outlets.length) || initialLoading);

  // If there's a permission error, show only that.
  if (!initialLoading && error && !outlets.length && user.role !== 'OWNER') {
    return <div><h1>Register New User</h1><p className={styles.error}>{error}</p></div>;
  }

  // Show a loading indicator while fetching initial data
  if (initialLoading) {
    return <div><h1>Register New User</h1><p>Loading...</p></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>Register New User</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Form fields... */}
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />

          <label>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={styles.input}
          >
            <option value="STAFF">Staff</option>
            <option value="MANAGER">Manager</option>
            <option value="OWNER">Owner</option>
          </select>

          {/* Only require outlet for roles that need it */}
          {needsOutlet && (
            <>
              <label>Assign to Outlet</label>
              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className={styles.input}
                required
              >
                <option value="">Select an outlet</option>
                {outlets.map(outlet => <option key={outlet.id} value={outlet.id}>{outlet.name}</option>)}
              </select>
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button type="submit" className={styles.submitButton} disabled={submitting || !canSubmit}>
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
