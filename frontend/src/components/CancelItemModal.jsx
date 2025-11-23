export default function CancelItemModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div style={{ padding: 16, background: "#fff", border: "1px solid #ccc" }}>
      <p>CancelItemModal placeholder</p>
      <button onClick={onClose}>Close</button>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
}
