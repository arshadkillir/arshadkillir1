import React, { useState, useEffect } from 'react';
import API from '@/services/api.js';
import { useSearchParams, Link } from 'react-router-dom';
import CreateOrderModal from '@/components/CreateOrderModal.jsx';
import CancelOrderModal from '@/components/CancelOrderModal.jsx';
import CancelItemModal from '@/components/CancelItemModal.jsx';
import BillReceipt from '@/components/BillReceipt.jsx';
import KOT from '@/components/KOT.jsx';
import DiscountModal from '@/components/DiscountModal.jsx';
import OrderCard from '@/components/OrderCard.jsx';
import styles from './Orders.module.css';

// These types correspond to your Prisma schema's OrderType enum
const ORDER_TYPES = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];

export default function Orders() {
  const [activeTab, setActiveTab] = useState(ORDER_TYPES[0]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [modalState, setModalState] = useState({
    create: false,
    cancelOrder: null,
    cancelItem: null,
    discount: null,
    printBill: null,
    printKOT: null,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch orders and menu items concurrently for faster loading
      const [ordersResponse, menuResponse] = await Promise.all([
        API.get('/orders'),
        API.get('/menu')
      ]);
      setOrders(ordersResponse.data);
      setMenuItems(menuResponse.data);
      setError(null); // Clear previous errors
    } catch (err) {
      setError('Failed to fetch orders. Please make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // If a 'table' UUID is in the URL, open the create order modal automatically.
    // This connects the QR code scan to the order creation flow.
    if (searchParams.get('table')) {
      setModalState(prev => ({ ...prev, create: true }));
    }
  }, []);

  // This effect handles printing robustly after the state has been updated.
  useEffect(() => {
    if (modalState.printBill || modalState.printKOT) {
      // This code runs after the component has re-rendered with the receipt.
      window.print();
      // Clean up the state after printing.
      setModalState(prev => ({ ...prev, printBill: null, printKOT: null }));
    }
  }, [modalState.printBill, modalState.printKOT]);

  // Helper functions to manage modal state for better readability
  const openModal = (modalName, data = null) => {
    setModalState(prev => ({ ...prev, [modalName]: data || true }));
  };

  const closeModal = (modalName) => {
    setModalState(prev => ({ ...prev, [modalName]: null }));
  };
  const handleDataRefresh = () => {
    fetchOrders(); // Re-fetch orders to show the new one
  };

  const handlePrintBill = (order) => {
    // Just set the state; the useEffect will handle the printing.
    setModalState(prev => ({ ...prev, printBill: order }));
  };

  const handlePrintKOT = (order) => {
    // Just set the state; the useEffect will handle the printing.
    setModalState(prev => ({ ...prev, printKOT: order }));
  };


  const filteredOrders = orders.filter(order => order.type === activeTab);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Orders</h1>
        <button onClick={() => openModal('create')} style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 15px' }}>
          + Create New Order
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className={styles.tabsContainer}>
        {ORDER_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`${styles.tabButton} ${activeTab === type ? styles.active : ''}`}
          >
            {/* Replace underscore with space for display */}
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {loading && <p>Loading orders...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          filteredOrders.length > 0 ? (
            <div className={styles.ordersGrid}>
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancelItem={(item) => openModal('cancelItem', item)}
                  onDiscount={(order) => openModal('discount', order)}
                  onPrintKOT={handlePrintKOT}
                  onPrintBill={handlePrintBill}
                  onCancelOrder={(order) => openModal('cancelOrder', order)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.noOrders}>
              <p>No {activeTab.replace('_', ' ').toLowerCase()} orders found.</p>
              <p>
                <Link to="/tables">Go to Tables</Link> to start a new order.
              </p>
            </div>
          )
        )}
      </div>

      {modalState.create && (
        <CreateOrderModal
          onClose={() => closeModal('create')}
          onOrderCreated={handleDataRefresh}
          orderType={activeTab}
          tableId={searchParams.get('table')}
          menuItems={menuItems} // Pass the pre-fetched menu items
        />
      )}

      {modalState.cancelOrder && (
        <CancelOrderModal
          order={modalState.cancelOrder}
          onClose={() => closeModal('cancelOrder')}
          onOrderCancelled={handleDataRefresh}
        />
      )}

      {modalState.cancelItem && (
        <CancelItemModal
          item={modalState.cancelItem}
          onClose={() => closeModal('cancelItem')}
          onItemCancelled={handleDataRefresh}
        />
      )}

      {modalState.discount && (
        <DiscountModal
          order={modalState.discount}
          onClose={() => closeModal('discount')}
          onDiscountApplied={handleDataRefresh}
        />
      )}

      {/* This component is hidden by default and only shown for printing */}
      <div id="print-area">
        {/* We can reuse the same print area for both bills and KOTs */}
        {modalState.printBill && <BillReceipt order={modalState.printBill} />}
        {modalState.printKOT && <KOT order={modalState.printKOT} />}
      </div>
    </div>
  );
}