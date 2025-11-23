import React from 'react';
import styles from './OrderCard.module.css';

/**
 * A card component to display a summary of a single order.
 * It provides action buttons for managing the order.
 */
export default function OrderCard({
  order,
  onCancelItem,
  onDiscount,
  onPrintKOT,
  onPrintBill,
  onCancelOrder,
}) {
  const { id, table, items, total, status, customerName, customerPhone } = order;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return styles.pending;
      case 'COMPLETED':
        return styles.completed;
      case 'CANCELLED':
        return styles.cancelled;
      default:
        return '';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.orderId}>Order #{id.slice(-6)}</span>
        <span className={`${styles.status} ${getStatusStyle(status)}`}>{status}</span>
      </div>
      <div className={styles.body}>
        {table && <p><strong>Table:</strong> {table.name}</p>}
        {customerName && <p><strong>Customer:</strong> {customerName} ({customerPhone})</p>}
        <ul className={styles.itemList}>
          {items.map(item => (
            <li key={item.id}>
              <span>{item.menuItem.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
              {item.status === 'PENDING' && (
                <button
                  onClick={() => onCancelItem(item)}
                  className={styles.cancelItemButton}
                  title="Cancel this item"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className={styles.total}>
          <strong>Total:</strong>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </div>
      {status === 'PENDING' && (
        <div className={styles.actions}>
          <button onClick={() => onPrintKOT(order)}>Print KOT</button>
          <button onClick={() => onDiscount(order)}>Discount</button>
          <button onClick={() => onPrintBill(order)} className={styles.primaryAction}>
            Generate Bill
          </button>
          <button onClick={() => onCancelOrder(order)} className={styles.dangerAction}>
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}