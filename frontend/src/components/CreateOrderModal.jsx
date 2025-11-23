import React, { useState } from 'react';
import API from '@/services/api.js';
import styles from './CreateOrderModal.module.css';

export default function CreateOrderModal({ onClose, onOrderCreated, orderType, tableId, menuItems = [] }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev =>
      prev.some(item => item.menuItemId === itemId)
        ? prev.filter(item => item.menuItemId !== itemId)
        : [...prev, { menuItemId: itemId, quantity: 1 }]
    );
  };

  const handleQuantityChange = (itemId, quantity) => {
    const newQuantity = Math.max(1, quantity); // Ensure quantity is at least 1
    setSelectedItems(prev =>
      prev.map(item =>
        item.menuItemId === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError('Please select at least one item.');
      return;
    }
    setLoading(true);
    setError('');

    const orderData = {
      type: orderType,
      items: selectedItems,
      ...(tableId && { tableId }), // Include tableId if it exists (for DINE_IN)
      ...(customerName && { customerName }),
      ...(customerPhone && { customerPhone }),
    };

    try {
      await API.post('/orders', orderData);
      onOrderCreated(); // Refresh the orders list
      onClose(); // Close the modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2>Create New Order</h2>
        <form onSubmit={handleSubmit}>
          {orderType !== 'DINE_IN' && (
            <>
              <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className={styles.input} />
              <input type="text" placeholder="Customer Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={styles.input} />
            </>
          )}
          <div className={styles.menuList}>
            {menuItems.map(item => (
              <div key={item.id} className={styles.menuItem}>
                <input type="checkbox" id={`item-${item.id}`} checked={selectedItems.some(si => si.menuItemId === item.id)} onChange={() => handleItemToggle(item.id)} />
                <label htmlFor={`item-${item.id}`}>{item.name} - ${item.price}</label>
                {selectedItems.some(si => si.menuItemId === item.id) && (
                  <input type="number" min="1" className={styles.quantityInput} value={selectedItems.find(si => si.menuItemId === item.id).quantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))} />
                )}
              </div>
            ))}
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.createButton}>{loading ? 'Creating...' : 'Create Order'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
