import React from 'react';
import styles from './KDSOrderCard.module.css';

// Helper to calculate how long ago the order was placed
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function KDSOrderCard({ order, onItemStatusUpdate }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'PREPARING': return styles['item--preparing'];
      case 'READY': return styles['item--ready'];
      case 'CANCELLED': return styles['item--cancelled'];
      default: return '';
    }
  };

  return (
    <div className={`${styles.ticket} ${styles[`ticket--${order.status.toLowerCase()}`]}`}>
      <div className={styles.ticketHeader}>
        <h3>{order.table?.name || order.type}</h3>
        <span>{timeSince(order.createdAt)}</span>
      </div>
      <ul className={styles.itemList}>
        {order.items.map(item => (
          <li key={item.id} className={`${styles.item} ${getStatusClass(item.status)}`}>
            <span className={styles.itemQuantity}>{item.quantity}x</span>
            <span className={styles.itemName}>{item.menuItem.name}</span>
            <div className={styles.itemActions}>
              {item.status === 'PENDING' && (
                <button onClick={() => onItemStatusUpdate(item.id, 'PREPARING')} className={styles.actionButton}>Prep</button>
              )}
              {item.status === 'PREPARING' && (
                <button onClick={() => onItemStatusUpdate(item.id, 'READY')} className={styles.actionButton}>Ready</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}