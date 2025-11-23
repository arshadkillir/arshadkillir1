import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '@/services/api.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import styles from './Bill.module.css';

export default function Bill() {
  const { tableUuid } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const billRef = useRef();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await API.get(`/orders/by-table/${tableUuid}`);
        setOrder(response.data);
      } catch (err) {
        // If no bill is found (404), don't show an error, let the component render the "No Active Bill" message.
        if (err.response?.status !== 404) {
          setError('Could not load bill. Please ask staff for assistance.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [tableUuid]);

  const handlePayBill = async () => {
    if (!order) return;
    setPaymentStatus('Processing...');
    try {
      // This reuses the existing quickPay logic which is perfect for this.
      await API.post('/tables/pay', { tableId: order.tableId });
      setPaymentStatus('Payment Successful! Thank you.');
    } catch (err) {
      setPaymentStatus('Payment failed. Please try again or contact staff.');
      console.error(err);
    }
  };

  const handleDownloadBill = () => {
    if (!billRef.current) return;
    html2canvas(billRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Bill-Order-${order.id.substring(0, 8)}.pdf`);
    });
  };

  if (loading) return <div className={styles.billWrapper}><p>Loading your bill...</p></div>;
  if (error) return <div className={styles.billWrapper}><p className={styles.error}>{error}</p></div>;
  if (!order) return <div className={styles.billWrapper}><h2>No Active Bill</h2><p>There is no active bill for this table. Feel free to place an order!</p></div>;

  return (
    <div className={styles.billWrapper}>
      <div ref={billRef}>
        <div className={styles.billHeader}>
          <div className={styles.logoPlaceholder}>LOGO</div>
          <h1 className={styles.header}>{order.outlet?.name || 'Our Restaurant'}</h1>
          <p className={styles.subHeader}>{order.outlet?.address || '123 Food Street, Flavor Town'}</p>
          <p className={styles.subHeader}>TRN: [Your TRN Here]</p>
        </div>

        <h2 className={styles.subHeader}>Order #{order.id.substring(0, 8)}</h2>

        <div>
          {order.items.map(item => (
            <div key={item.id} className={styles.itemRow}>
              <span>{item.menuItem.name} x {item.quantity}</span>
              <span>${(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className={styles.totalRow}>
          <span>Total</span>
          <span>${Number(order.finalTotal).toFixed(2)}</span>
        </div>

        <div className={styles.billFooter}>
          <p>Thank you for dining with us!</p>
        </div>
      </div>

      <div className={styles.actionsSection}>
        {!paymentStatus ? (
          <>
            <button onClick={handlePayBill} className={styles.payButton}>
              Pay Now
            </button>
            <button onClick={handleDownloadBill} className={styles.downloadButton}>
              Download
            </button>
          </>
        ) : (
          <p className={styles.paymentStatus}>{paymentStatus}</p>
        )}
      </div>
    </div>
  );
}