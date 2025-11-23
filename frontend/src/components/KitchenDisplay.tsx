import React, { useEffect, useRef, useState } from "react";
import styles from "./KitchenDisplay.module.css";
import { receiptSettings } from "@/config/receiptSettings";

type Item = {
  id: string;
  quantity: number;
  menuItem: {
    name: string;
    modifiers?: string[];
    notes?: string;
  };
};

export type Order = {
  id: string;
  items: Item[];
  orderType?: "dine-in" | "take-away" | "delivery";
  tableNumber?: string;
  user?: { name?: string };
  notes?: string;
  status?: "NEW" | "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
  createdAt?: string;
};

interface KitchenDisplayProps {
  /** Optional: override WebSocket base URL */
  wsBaseUrl?: string;
  /** Optional: initial orders (useful for server-side fetch) */
  initialOrders?: Order[];
  /** Optional: sound on new order */
  enableSound?: boolean;
  /** Optional: outletId to subscribe (defaults to outlet.outlet_name) */
  outletId?: string;
}

export default function KitchenDisplay({
  wsBaseUrl = "wss://yourserver.example/ws",
  initialOrders = [],
  enableSound = true,
  outletId,
}: KitchenDisplayProps) {
  const { tenant, outlet } = receiptSettings;
  const channel = outletId ?? outlet?.outlet_name ?? "default-outlet";
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simple beep sound (data URI short beep) — optional
  useEffect(() => {
    if (!enableSound) return;
    const audio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
    );
    audioRef.current = audio;
  }, [enableSound]);

  // WebSocket connection and handlers
  useEffect(() => {
    const wsUrl = `${wsBaseUrl}/outlet/${encodeURIComponent(channel)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.info("KDS WebSocket connected", wsUrl);
      // Optionally request initial orders
      ws.send(JSON.stringify({ action: "subscribe", outlet: channel }));
    };

    ws.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        // Expected payload types: order_created, order_updated, order_removed
        if (payload.type === "order_created" && payload.order) {
          setOrders((prev) => [payload.order as Order, ...prev]);
          if (enableSound && audioRef.current) audioRef.current.play().catch(() => {});
        } else if (payload.type === "order_updated" && payload.order) {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.order.id ? (payload.order as Order) : o))
          );
        } else if (payload.type === "order_removed" && payload.orderId) {
          setOrders((prev) => prev.filter((o) => o.id !== payload.orderId));
        }
      } catch (err) {
        console.error("Invalid WS payload", err);
      }
    };

    ws.onclose = () => {
      console.warn("KDS WebSocket disconnected, attempting reconnect in 3s");
      // simple reconnect strategy
      setTimeout(() => {
        if (wsRef.current === ws) {
          wsRef.current = null;
          // re-run effect by updating state (simple approach: reload page or re-mount)
          window.location.reload();
        }
      }, 3000);
    };

    ws.onerror = (e) => {
      console.error("KDS WebSocket error", e);
    };

    return () => {
      try {
        ws.send(JSON.stringify({ action: "unsubscribe", outlet: channel }));
      } catch {}
      ws.close();
    };
  }, [wsBaseUrl, channel, enableSound]);

  // Update order status (optimistic + send to server)
  const updateStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      wsRef.current?.send(JSON.stringify({ action: "update_status", orderId, status }));
    } catch (e) {
      console.error("Failed to send status update", e);
    }
  };

  // Print KOT: open a new window with minimal HTML and call print
  const printKOT = (order: Order) => {
    const win = window.open("", "_blank", "width=400,height=800");
    if (!win) return;
    const html = `
      <html>
        <head>
          <title>KOT - ${order.id}</title>
          <style>
            body { font-family: monospace; width: 80mm; margin: 0; padding: 8px; }
            h2 { margin: 0 0 6px 0; font-size: 16px; }
            .meta { font-size: 12px; margin-bottom: 6px; }
            .item { margin-bottom: 6px; font-weight:700; }
            .mod { margin-left: 12px; font-weight:400; font-style:italic; }
            .cut { margin-top: 12px; border-top: 1px dashed #000; padding-top: 6px; }
          </style>
        </head>
        <body>
          <h2>${tenant?.name_en ?? ""}</h2>
          ${tenant?.name_ar ? `<div style="direction:rtl">${tenant.name_ar}</div>` : ""}
          <div class="meta">Outlet: ${outlet?.outlet_name ?? ""}</div>
          <div class="meta">Order: ${order.id} | ${order.orderType ?? ""} ${order.tableNumber ? "| Table " + order.tableNumber : ""}</div>
          <div>
            ${order.items
              .map(
                (it) => `
              <div class="item">${it.quantity} x ${escapeHtml(it.menuItem.name)}</div>
              ${
                it.menuItem.modifiers && it.menuItem.modifiers.length
                  ? it.menuItem.modifiers.map((m) => `<div class="mod">• ${escapeHtml(m)}</div>`).join("")
                  : ""
              }
              ${it.menuItem.notes ? `<div class="mod">Note: ${escapeHtml(it.menuItem.notes)}</div>` : ""}
            `
              )
              .join("")}
          </div>
          ${order.notes ? `<div class="meta">Order Notes: ${escapeHtml(order.notes)}</div>` : ""}
          <div class="cut">-- KOT --</div>
          <script>window.print(); setTimeout(()=>window.close(), 500);</script>
        </body>
      </html>
    `;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  // Utility: escape HTML for print content
  const escapeHtml = (str?: string) =>
    (str ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m] as string));

  // Determine RTL
  const isRtl = Boolean(tenant?.name_ar);

  return (
    <div className={`${styles.kdsGrid} ${isRtl ? styles.rtl : ""}`} role="region" aria-label="Kitchen Display">
      {orders.map((order) => {
        const statusClass =
          order.status === "PREPARING"
            ? "ticket--preparing"
            : order.status === "READY"
            ? "ticket--ready"
            : order.status === "PENDING" || order.status === "NEW"
            ? "ticket--pending"
            : "";

        return (
          <section
            key={order.id}
            className={`${styles.ticket} ${styles[statusClass] ?? ""}`}
            aria-live="polite"
            aria-label={`Order ${order.id} ${order.status ?? ""}`}
          >
            <header className={styles.ticketHeader}>
              <div>
                <h3>{tenant?.name_en ?? "Kitchen"}</h3>
                <div className={styles.smallMeta}>{outlet?.outlet_name}</div>
              </div>

              <div className={styles.ticketMeta}>
                <span className={styles.smallMeta}>{order.orderType ?? "N/A"}</span>
                <div className={styles.smallMeta}>{new Date(order.createdAt ?? Date.now()).toLocaleTimeString()}</div>
              </div>
            </header>

            <ul className={styles.itemList}>
              {order.items.map((it) => {
                const itemStatusClass =
                  order.status === "PREPARING" ? "item--preparing" : order.status === "READY" ? "item--ready" : "";
                return (
                  <li key={it.id} className={`${styles.item} ${styles[itemStatusClass] ?? ""}`}>
                    <div className={styles.itemQuantity}>{it.quantity}</div>
                    <div className={styles.itemName}>
                      {it.menuItem.name}
                      {it.menuItem.modifiers && it.menuItem.modifiers.length > 0 && (
                        <div className={styles.modifiers}>
                          {it.menuItem.modifiers.map((m, i) => (
                            <div key={i} className={styles.modifier}>
                              • {m}
                            </div>
                          ))}
                        </div>
                      )}
                      {it.menuItem.notes && <div className={styles.note}>Note: {it.menuItem.notes}</div>}
                    </div>

                    <div className={styles.itemActions}>
                      <button
                        className={`${styles.actionButton} ${styles.primary}`}
                        onClick={() => updateStatus(order.id, "PREPARING")}
                        aria-label={`Start ${it.menuItem.name}`}
                      >
                        Start
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {order.notes && (
              <div className={styles.ticketFooter}>
                <div className={styles.smallMeta}>Notes: {order.notes}</div>
                <div />
              </div>
            )}

            <div className={styles.ticketFooter}>
              <div style={{ display: "flex", gap: 8 }}>
                <button className={`${styles.actionButton}`} onClick={() => updateStatus(order.id, "ACCEPTED")}>
                  Accept
                </button>
                <button className={`${styles.actionButton} ${styles.primary}`} onClick={() => updateStatus(order.id, "PREPARING")}>
                  Start
                </button>
                <button className={`${styles.actionButton} ${styles.positive}`} onClick={() => updateStatus(order.id, "READY")}>
                  Ready
                </button>
                <button className={`${styles.actionButton}`} onClick={() => updateStatus(order.id, "SERVED")}>
                  Served
                </button>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className={styles.actionButton} onClick={() => printKOT(order)}>
                  Print KOT
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => {
                    // quick remove from UI (server should also remove)
                    setOrders((prev) => prev.filter((o) => o.id !== order.id));
                    try {
                      wsRef.current?.send(JSON.stringify({ action: "remove_order", orderId: order.id }));
                    } catch {}
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
