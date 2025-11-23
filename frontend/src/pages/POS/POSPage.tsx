import { useState } from "react";
import styles from "./POSPage.module.css";

import CategorySidebar from "./components/CategorySidebar";
import ProductGrid from "./components/ProductGrid";
import CartPanel from "./components/CartPanel";

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);

  return (
    <div className={styles.posContainer}>
      <CategorySidebar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <ProductGrid
        selectedCategory={selectedCategory}
        onAddToCart={(product) =>
          setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
              return prev.map((item) =>
                item.id === product.id
                  ? { ...item, qty: item.qty + 1 }
                  : item
              );
            }
            return [...prev, { ...product, qty: 1 }];
          })
        }
      />

      <CartPanel cart={cart} setCart={setCart} />
    </div>
  );
}
