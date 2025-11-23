export default function CancelOrderModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div style={{ padding: 16, background: "#fff", border: "1px solid #ccc" }}>
      <p>CancelOrderModal placeholder</p>
      <button onClick={onClose}>Close</button>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
}
