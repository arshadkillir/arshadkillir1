import React, { useState, useEffect } from 'react';
import API from '@/services/api.js';
import styles from './Menu.module.css'; // You can create a new simplified CSS file

// Using a data URI for the placeholder to avoid a missing file error.
const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e9ecef"/%3E%3Ctext x="50" y="55" font-family="Arial" font-size="12" fill="%236c757d" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await API.get('/menu/items');
        setMenuItems(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch menu items. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Our Menu</h1>
      </div>
      {loading && <p>Loading menu...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <div className={styles.grid}>
          {menuItems.map(item => (
            <div key={item.id} className={styles.card}>
              <img 
                src={item.imageUrl ? `${API.defaults.baseURL}${item.imageUrl}` : placeholderImage} 
                alt={item.name} 
                className={styles.itemImage}
              />
              <h3>{item.name}</h3>
              <p>{item.description || 'No description available.'}</p>
              <p className={styles.price}>${Number(item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}