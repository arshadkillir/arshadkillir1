import React, { useState, useEffect, useMemo } from 'react';
import API from '@/services/api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import styles from './Purchases.module.css';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Form state for new purchase
  const [supplier, setSupplier] = useState('');
  const [poItems, setPoItems] = useState([]); // State for items in the current PO

  // State for the item entry form
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  // State for autocomplete
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await API.get('/purchases');
      setPurchases(response.data);
    } catch (err) {
      setError('Failed to fetch purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const search = async () => {
      try {
        const response = await API.get(`/inventory/search?q=${searchTerm}`);
        setSearchResults(response.data);
      } catch (err) {
        console.error('Search failed', err);
      }
    };
    const debounce = setTimeout(search, 300); // Debounce to avoid excessive API calls
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleAddItemToPo = () => {
    if (!itemName || !quantity || !price) {
      setError('Please fill all item fields before adding.');
      return;
    }
    const newItem = {
      name: itemName,
      quantity: parseInt(quantity),
      price: parseFloat(price),
    };
    setPoItems([...poItems, newItem]);
    // Clear item form
    setItemName('');
    setSearchTerm('');
    setQuantity('');
    setPrice('');
    setError('');
  };

  const handleRemoveItemFromPo = (indexToRemove) => {
    setPoItems(currentItems => currentItems.filter((_, index) => index !== indexToRemove));
  };

  const poTotal = useMemo(() => {
    return poItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [poItems]);

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    if (poItems.length === 0) {
      setError('Please add at least one item to the purchase order.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await API.post('/purchases', {
        outletId: user.outletId,
        supplier,
        items: poItems,
      });
      // Clear form and refetch
      setSupplier('');
      setPoItems([]);
      fetchPurchases();
    } catch (err) {
      setError('Failed to create purchase order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Purchase Orders</h1>

      <div className={`${styles.card} ${styles.formCard}`}>
        <h2>Create New Purchase Order</h2>
        <form onSubmit={handleCreatePurchase}>
          <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier Name (Optional)" className={styles.input} />
          
          <div className={styles.addItemSection}>
            <h4>Add Item to PO</h4>
            <div className={styles.autocompleteContainer}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setItemName(e.target.value); }}
                placeholder="Search Inventory Item..."
                className={styles.input}
              />
              {searchResults.length > 0 && (
                <div className={styles.autocompleteResults}>
                  {searchResults.map(item => (
                    <div key={item.id} onClick={() => { setItemName(item.name); setSearchTerm(item.name); setSearchResults([]); }} className={styles.autocompleteItem}>{item.name}</div>
                  ))}
                </div>
              )}
            </div>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" className={styles.input} min="1" />
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Unit Price" className={styles.input} min="0" />
            <button type="button" onClick={handleAddItemToPo} className={styles.addButton} disabled={isSubmitting}>+ Add Item</button>
          </div>

          {poItems.length > 0 && (
            <div>
              <h4>Items in this PO</h4>
              <ul className={styles.poItemsList}>
                {poItems.map((item, index) => (
                  <li key={index} className={styles.poItem}>
                    <span>{item.name} x {item.quantity} @ ${Number(item.price).toFixed(2)}</span>
                    <button type="button" onClick={() => handleRemoveItemFromPo(index)} className={styles.removeButton} disabled={isSubmitting}>Remove</button>
                  </li>
                ))}
              </ul>
              <div className={styles.poTotal}>
                PO Total: ${poTotal.toFixed(2)}
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Record Purchase'}
          </button>
        </form>
      </div>

      {loading && <p>Loading purchases...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <h2>History</h2>
        {purchases.map(purchase => (
          <div key={purchase.id} className={styles.card}>
            <div className={styles.historyHeader}>
              <span>PO #{purchase.id} - {purchase.supplier || 'N/A'}</span>
              <span>{new Date(purchase.createdAt).toLocaleDateString()}</span>
            </div>
            <p><strong>Total:</strong> ${Number(purchase.total).toFixed(2)}</p>
            <ul>
              {purchase.items.map(item => <li key={item.id}>{item.name} x {item.quantity} @ ${Number(item.price).toFixed(2)}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}