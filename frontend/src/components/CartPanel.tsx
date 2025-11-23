import { useState } from "react";
import CheckoutModal from "@/components/CheckoutModal";
import styles from "./CartPanel.module.css";

export default function CartPanel({ cart, setCart }) {
  const [showCheckout, setShowCheckout] = useState(false);

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className={styles.cartPanel}>
      <h2>Order</h2>

      <div className={styles.cartItems}>
        {cart.map((item) => (
          <div key={item.id} className={styles.cartItem}>
            <div>
              <strong>{item.name}</strong>
              <div className={styles.price}>${item.price}</div>
            </div>

            <div className={styles.qtyControls}>
              <button onClick={() => updateQty(item.id, -1)}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => updateQty(item.id, +1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.totalRow}>
        <span>Total:</span>
        <strong>${total.toFixed(2)}</strong>
      </div>

      <button
        className={styles.checkoutButton}
        onClick={() => setShowCheckout(true)}
      >
        Checkout
      </button>

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onComplete={(payment) => {
            console.log("Payment completed:", payment);
            setCart([]);
            setShowCheckout(false);
          }}
        />
      )}
    </div>
  );
}
