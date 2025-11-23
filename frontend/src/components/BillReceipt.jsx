import React from 'react';

// This component is designed to be printed.
// It will be hidden in the normal view and only visible in the print preview.
export default function BillReceipt({ order }) {
  if (!order) return null;

  const receiptStyle = {
    width: '300px', // Standard thermal printer width
    margin: '0 auto',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '12px',
    color: '#000',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '1rem',
  };

  const itemRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.25rem',
  };

  const totalSectionStyle = {
    marginTop: '1rem',
    borderTop: '1px dashed #000',
    paddingTop: '0.5rem',
  };

  // In a real app, tax would be calculated based on rules.
  const taxRate = 0.08;
  const subtotal = Number(order.total);
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;

  return (
    <div style={receiptStyle}>
      <div style={headerStyle}>
        <h3>Nandeyal POS</h3>
        <p>Demo Outlet</p>
        <p>{new Date().toLocaleString()}</p>
      </div>
      <div>
        <p>Order: #{order.id}</p>
        <p>Served by: {order.user?.name || 'N/A'}</p>
      </div>
      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '0.5rem 0' }}>
        {order.items.map(item => (
          <div key={item.id}>
            <div>{item.menuItem.name}</div>
            <div style={itemRowStyle}>
              <span>{item.quantity} x ${Number(item.menuItem.price).toFixed(2)}</span>
              <span>${(item.quantity * Number(item.menuItem.price)).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={totalSectionStyle}>
        <div style={itemRowStyle}>
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div style={itemRowStyle}>
          <span>Tax ({ (taxRate * 100).toFixed(0) }%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div style={{ ...itemRowStyle, fontWeight: 'bold', marginTop: '0.5rem' }}>
          <span>TOTAL:</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Thank you for your visit!</p>
      </div>
    </div>
  );
}