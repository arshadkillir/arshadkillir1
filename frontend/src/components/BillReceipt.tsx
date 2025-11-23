import React from "react";
import styles from "./BillReceipt.module.css";
import { receiptSettings } from "@/config/receiptSettings";
// Optional: install these if you want QR / barcode on receipts
// npm install react-qr-code react-barcode
import QRCode from "react-qr-code";
import Barcode from "react-barcode";

interface OrderItem {
  id: string;
  quantity: number;
  menuItem: {
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  total: number; // total is the gross amount (including VAT)
  items: OrderItem[];
  orderType?: "dine-in" | "take-away" | "delivery";
  tableNumber?: string;
  user?: {
    name?: string;
  };
  payment?: {
    type: "cash" | "card" | "split";
    cash?: number;
    card?: number;
    change?: number;
  };
}

interface BillReceiptProps {
  order: Order | null;
  duplicate?: boolean; // ✅ Print two copies
  showQr?: boolean;
  showBarcode?: boolean;
}

export default function BillReceipt({
  order,
  duplicate = true,
  showQr = true,
  showBarcode = true,
}: BillReceiptProps) {
  if (!order) return null;

  const { tenant, outlet } = receiptSettings;

  // VAT calculation (assumes order.total is gross amount including VAT)
  const vatRate = (tenant?.vat_percentage ?? 0) / 100;
  const gross = order.total;
  const netAmount = vatRate > 0 ? gross / (1 + vatRate) : gross;
  const vatAmount = gross - netAmount;

  // Fallbacks
  const copies = duplicate ? ["Customer Copy", "Merchant Copy"] : ["Receipt"];
  const invoiceNumber = `${outlet?.invoice_prefix ?? ""}${order.id}`;

  // Format currency helper
  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className={styles.printContainer}>
      {copies.map((copyLabel, index) => (
        <div key={index} className={styles.receipt} aria-label={copyLabel}>
          {/* Header */}
          <div className={styles.header}>
            {tenant?.logo_url && (
              // logo_url should point to a public asset or absolute URL
              // ensure the image is optimized for thermal printing (B/W PNG)
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logo_url} alt={`${tenant.name_en} logo`} className={styles.logo} />
            )}

            <h3 className={styles.tenantName}>{tenant?.name_en}</h3>
            {tenant?.name_ar && <h4 className={styles.arabic}>{tenant.name_ar}</h4>}

            <p className={styles.outletName}>{outlet?.outlet_name}</p>
            {outlet?.address && <p className={styles.address}>{outlet.address}</p>}
            {outlet?.phone && <p className={styles.phone}>{outlet.phone}</p>}

            {tenant?.trn && (
              <p className={styles.trn}>
                <strong>TRN:</strong> {tenant.trn}
              </p>
            )}

            <p className={styles.dateTime}>{new Date().toLocaleString()}</p>

            {/* Paid badge */}
            <div className={styles.paidBadge}>✅ PAID</div>

            {/* Copy label */}
            <div className={styles.copyLabel}>{copyLabel}</div>
          </div>

          {/* Order Info */}
          <div className={styles.section}>
            <p>
              <strong>Invoice:</strong> {invoiceNumber}
            </p>
            <p>
              <strong>Order #:</strong> {order.id}
            </p>
            <p>
              <strong>Served by:</strong> {order.user?.name ?? "N/A"}
            </p>
            <p>
              <strong>Order Type:</strong> {(order.orderType ?? "N/A").toUpperCase()}
            </p>
            {order.orderType === "dine-in" && (
              <p>
                <strong>Table:</strong> {order.tableNumber ?? "N/A"}
              </p>
            )}
          </div>

          {/* Items */}
          <div className={styles.itemsSection}>
            {order.items?.map((item) => (
              <div key={item.id} className={styles.itemBlock}>
                <div className={styles.itemName}>{item.menuItem.name}</div>
                <div className={styles.itemRow}>
                  <span>
                    {item.quantity} × {formatCurrency(item.menuItem.price)}
                  </span>
                  <span>{formatCurrency(item.quantity * item.menuItem.price)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className={styles.totalSection}>
            <div className={styles.row}>
              <span>Net Amount</span>
              <span>{formatCurrency(netAmount)}</span>
            </div>

            <div className={styles.row}>
              <span>VAT ({tenant?.vat_percentage ?? 0}%)</span>
              <span>{formatCurrency(vatAmount)}</span>
            </div>

            <div className={styles.totalRow}>
              <span>GRAND TOTAL</span>
              <span>{formatCurrency(gross)}</span>
            </div>
          </div>

          {/* Payment Details */}
          {order.payment && (
            <div className={styles.section}>
              <p>
                <strong>Payment:</strong> {order.payment.type.toUpperCase()}
              </p>

              {order.payment.type === "cash" && (
                <>
                  <div className={styles.row}>
                    <span>Cash Tendered</span>
                    <span>{formatCurrency(order.payment.cash ?? 0)}</span>
                  </div>
                  <div className={styles.row}>
                    <span>Change</span>
                    <span>{formatCurrency(order.payment.change ?? 0)}</span>
                  </div>
                </>
              )}

              {order.payment.type === "card" && order.payment.card != null && (
                <div className={styles.row}>
                  <span>Card</span>
                  <span>{formatCurrency(order.payment.card)}</span>
                </div>
              )}

              {order.payment.type === "split" && (
                <>
                  <div className={styles.row}>
                    <span>Cash</span>
                    <span>{formatCurrency(order.payment.cash ?? 0)}</span>
                  </div>
                  <div className={styles.row}>
                    <span>Card</span>
                    <span>{formatCurrency(order.payment.card ?? 0)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* QR + Barcode */}
          <div className={styles.section}>
            {showQr && (
              <div className={styles.qrContainer}>
                <QRCode
                  value={`https://yourdomain.com/receipt/${order.id}`}
                  size={80}
                  level="M"
                />
              </div>
            )}

            {showBarcode && (
              <div className={styles.barcode}>
                <Barcode value={invoiceNumber} format="CODE128" width={1} height={40} displayValue={false} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p>Thank you for visiting!</p>
            {tenant?.name_en && <p>{tenant.name_en}</p>}
            {tenant?.name_ar && <p className={styles.arabic}>{tenant.name_ar}</p>}
            {tenant?.logo_url && <p className={styles.website}>www.example.com</p>}
          </div>

          {/* Duplicate copy divider (not printed on last copy) */}
          {index === 0 && duplicate && <div className={styles.copyDivider} />}
        </div>
      ))}
    </div>
  );
}
