import React, { useState } from 'react';
import API from '@/services/api.js';
import styles from './Customers.module.css';

export default function Customers() {
  const [phone, setPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter a phone number.');
      return;
    }
    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await API.get(`/customers/search?phone=${phone}`);
      setSearchResult(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An error occurred.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Customer History</h1>
      <form onSubmit={handleSearch} className={styles.searchContainer}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Search by phone number..."
          className={styles.input}
        />
        <button type="submit" className={styles.searchButton} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {searchResult && (
        <div>
          <h2>{searchResult.customer.name}</h2>
          <p><strong>Phone:</strong> {searchResult.customer.phone}</p>
          <h3>Order History ({searchResult.orders.length})</h3>
          <div>
            {searchResult.orders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span>Order #{order.id}</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <p><strong>Status:</strong> {order.status} | <strong>Total:</strong> ${Number(order.total).toFixed(2)}</p>
                <ul>
                  {order.items.map(item => <li key={item.id}>{item.menuItem.name} x {item.quantity}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}