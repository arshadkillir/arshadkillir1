import React, { useState, useEffect } from 'react';
import API from '@/services/api.js';
import EditUserModal from '@/components/EditUserModal.jsx';
import ResetPasswordModal from '@/components/ResetPasswordModal.jsx';
import styles from './UserManagement.module.css';
import { useAuth } from '../context/AuthContext.jsx'; // Import useAuth

export default function UserManagement() {
  const { user: currentUser } = useAuth(); // Get current user from AuthContext
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [userToReset, setUserToReset] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Role-based access control
    if (currentUser.role !== 'OWNER' && currentUser.role !== 'SUPERADMIN') {
      setError('You do not have permission to manage users.');
      setLoading(false);
      return;
    }
    fetchUsers(); // Only fetch users if the role is appropriate
  }, [currentUser]);

  const handleUserUpdated = () => {
    setEditingUser(null);
    fetchUsers();
  };

  const handleUserStatusChange = async (user, action) => {
    const isDeactivating = action === 'deactivate';
    const confirmationMessage = isDeactivating
      ? `Are you sure you want to deactivate ${user.name}? They will no longer be able to log in.`
      : `Are you sure you want to reactivate ${user.name}?`;

    if (window.confirm(confirmationMessage)) {
      try {
        // Both actions should update the user's status
        const newStatus = !user.isActive;
        await API.put(`/users/${user.id}/status`, { isActive: newStatus });
        fetchUsers(); // Refresh the list after the update
      } catch (err) {
        setError(`Failed to ${action} user.`);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1>User Management</h1>
      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Role</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Outlet</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className={styles.td}>{user.name}</td>
                <td className={styles.td}>{user.email}</td>
                <td className={styles.td}>{user.role}</td>
                <td className={styles.td}>
                  <span className={`${styles.status} ${user.isActive ? styles.statusActive : styles.statusInactive}`}>
                    {user.isActive ? 'Active' : 'Inactive'} 
                  </span>
                </td>
                <td className={styles.td}>{user.outlet?.name || 'N/A'}</td>
                <td className={styles.td}><div className={styles.actionsContainer}>
                  <button 
                    className={styles.actionButton} 
                    onClick={() => setEditingUser(user)}>Edit</button>
                  <button 
                    className={`${styles.actionButton} ${styles['actionButton--reset']}`} 
                    onClick={() => setUserToReset(user)}>Reset Password</button>
                  {user.isActive 
                    ? <button 
                        className={`${styles.actionButton} ${styles['actionButton--deactivate']}`} 
                        onClick={() => handleUserStatusChange(user, 'deactivate')}>Deactivate</button>
                    : <button 
                        className={`${styles.actionButton} ${styles['actionButton--reactivate']}`} 
                        onClick={() => handleUserStatusChange(user, 'reactivate')}>Reactivate</button>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
      {userToReset && (
        <ResetPasswordModal
          user={userToReset}
          onClose={() => setUserToReset(null)}
        />
      )}
    </div>
  );
}