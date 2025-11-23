import React from "react";
import styles from "./KitchenOrderTicket.module.css";
import { receiptSettings } from "@/config/receiptSettings";

interface OrderItem {
  id: string;
  quantity: number;
  menuItem: {
    name: string;
    modifiers?: string[]; // e.g., ["No onion", "Extra spicy"]
    notes?: string;
  };
}

interface Order {
  id: string;
  items: OrderItem[];
  orderType?: "dine-in" | "take-away" | "delivery";
  tableNumber?: string;
  user?: {
    name?: string;
  };
  notes?: string;
}

interface KitchenOrderTicketProps {
  order: Order | null;
  printerCopyLabel?: string; // e.g., "KITCHEN"
}

export default function KitchenOrderTicket({
  order,
  printerCopyLabel = "KITCHEN",
}: KitchenOrderTicketProps) {
  if (!order) return null;

  const { outlet, tenant } = receiptSettings;
  const createdAt = new Date().toLocaleString();

  return (
    <div className={styles.kotContainer} aria-label="Kitchen Order Ticket">
      <div className={styles.kot}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            {tenant?.name_en && <div className={styles.brandEn}>{tenant.name_en}</div>}
            {outlet?.outlet_name && <div className={styles.outlet}>{outlet.outlet_name}</div>}
          </div>

          <div className={styles.meta}>
            <div className={styles.copyLabel}>{printerCopyLabel}</div>
            <div className={styles.time}>{createdAt}</div>
          </div>
        </div>

        {/* Order Info */}
        <div className={styles.info}>
          <div className={styles.row}>
            <strong>Order:</strong>
            <span>{order.id}</span>
          </div>
          <div className={styles.row}>
            <strong>Type:</strong>
            <span>{(order.orderType ?? "N/A").toUpperCase()}</span>
          </div>
          {order.orderType === "dine-in" && (
            <div className={styles.row}>
              <strong>Table:</strong>
              <span>{order.tableNumber ?? "N/A"}</span>
            </div>
          )}
          <div className={styles.row}>
            <strong>Served by:</strong>
            <span>{order.user?.name ?? "N/A"}</span>
          </div>
        </div>

        {/* Items (no prices) */}
        <div className={styles.items}>
          {order.items.map((it) => (
            <div key={it.id} className={styles.itemBlock}>
              <div className={styles.itemMain}>
                <span className={styles.qty}>{it.quantity}x</span>
                <span className={styles.itemName}>{it.menuItem.name}</span>
              </div>

              {/* Modifiers */}
              {it.menuItem.modifiers && it.menuItem.modifiers.length > 0 && (
                <div className={styles.modifiers}>
                  {it.menuItem.modifiers.map((m, i) => (
                    <div key={i} className={styles.modifier}>
                      • {m}
                    </div>
                  ))}
                </div>
              )}

              {/* Item notes */}
              {it.menuItem.notes && <div className={styles.note}>Note: {it.menuItem.notes}</div>}
            </div>
          ))}
        </div>

        {/* Order-level notes */}
        {order.notes && (
          <div className={styles.orderNotes}>
            <strong>Order Notes:</strong>
            <div className={styles.noteText}>{order.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.cutLine}>— — — — — — — — — —</div>
        </div>
      </div>
    </div>
  );
}
