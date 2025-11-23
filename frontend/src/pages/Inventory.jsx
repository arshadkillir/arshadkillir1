import React, { useState, useEffect } from 'react';
import API from '@/services/api.js';
import styles from './Inventory.module.css';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await API.get('/inventory');
        setInventory(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch inventory data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Inventory</h1>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by item name..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p>Loading inventory...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Item Name</th>
              <th className={styles.th}>Quantity on Hand</th>
              <th className={styles.th}>Unit</th>
              <th className={styles.th}>Minimum Level</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id} className={item.qtyOnHand < item.minLevel ? styles.lowStockRow : ''}>
                <td className={styles.td}>{item.name}</td>
                <td className={styles.td}>{item.qtyOnHand}</td>
                <td className={styles.td}>{item.unit}</td>
                <td className={styles.td}>{item.minLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
