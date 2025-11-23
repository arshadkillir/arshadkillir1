import { useState, useEffect, useMemo } from 'react';
import apiFetch from '@/api';
import styles from './CreateOrderModal.module.css';

// --- Define Data Shapes ---
interface Table {
  id: string;
  name: string;
  outletId: string;
}

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  variants: Variant[];
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface CartItem {
  cartId: string;
  menuItemId: string;
  variantId: string | null;
  name: string;
  price: number;
  quantity: number;
}

// --- Define Component Props ---
interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  onOrderCreated: (newOrder: any) => void;
}

export default function CreateOrderModal({ isOpen, onClose, table, onOrderCreated }: CreateOrderModalProps) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && table?.outletId) {
      const fetchMenu = async () => {
        try {
          setLoading(true);
          setError(null);
          const menuCategories = await apiFetch<MenuCategory[]>(`/menu?outletId=${table.outletId}`);
          const allItems = menuCategories?.flatMap(category => category.items) || [];
          setMenu(allItems);
        } catch (err: any) {
          setError('Failed to load menu. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchMenu();
    } else {
      setCart([]);
      setSearchTerm('');
      setError(null);
    }
  }, [isOpen, table]);

  const addToCart = (item: MenuItem, variant: Variant | null = null) => {
    if (item.variants && item.variants.length > 0 && !variant) {
      console.log("Please select a variant for", item.name);
      return;
    }

    const cartItemId = variant ? `${item.id}-${variant.id}` : item.id;
    const itemName = variant ? `${item.name} (${variant.name})` : item.name;
    const itemPrice = variant ? variant.price : item.price;

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.cartId === cartItemId);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.cartId === cartItemId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, {
        cartId: cartItemId,
        menuItemId: item.id,
        variantId: variant ? variant.id : null,
        name: itemName,
        price: itemPrice,
        quantity: 1
      }];
    });
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      );
      return updatedCart.filter(item => item.quantity > 0);
    });
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0 || !table) {
      setError('Please add at least one item to the order.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const orderData = {
        tableId: table.id,
        outletId: table.outletId,
        type: 'DINE_IN',
        items: cart.map(({ menuItemId, variantId, quantity }) => ({ menuItemId, variantId, quantity })),
      };

      const newOrder = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      onOrderCreated(newOrder);
    } catch (err: any) {
      setError('Failed to create order. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenu = useMemo(() => {
    return menu.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menu, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>New Order for {table?.name}</h2>
        <div className={styles.container}>
          <div className={styles.menuSection}>
            <input
              type="text"
              placeholder="Search menu..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={styles.menuList}>
              {loading && <p>Loading menu...</p>}
              {filteredMenu.map(item => (
                item.variants && item.variants.length > 0 ? (
                  <div key={item.id} className={styles.menuItemGroup}>
                    <span className={styles.menuItemName}>{item.name}</span>
                    <div className={styles.variantList}>
                      {item.variants.map(variant => (
                        <div key={variant.id} className={styles.menuItemVariant} onClick={() => addToCart(item, variant)}>
                          <span>{variant.name}</span>
                          <span>${Number(variant.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div key={item.id} className={styles.menuItem} onClick={() => addToCart(item)}>
                    <span>{item.name}</span>
                    <span>${Number(item.price).toFixed(2)}</span>
                  </div>
                )
              ))}
            </div>
          </div>
          <div className={styles.cartSection}>
            <h3>Current Order</h3>
            {cart.length === 0 ? (
              <p>Click items to add them to the order.</p>
            ) : (
              <ul className={styles.cartList}>
                {cart.map((item) => (
                  <li key={item.cartId} className={styles.cartItem}>
                    <span>{item.name}</span>
                    <div className={styles.quantityControl}>
                      <button onClick={() => updateQuantity(item.cartId, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)}>+</button>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelButton} disabled={loading}>Cancel</button>
          <button onClick={handleCreateOrder} className={styles.createButton} disabled={loading || cart.length === 0}>
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
}