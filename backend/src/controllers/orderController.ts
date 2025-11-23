export const placeholder = (req, res) => {
  return res.json({ message: 'orderController.ts OK' });
};

export const getOrders = (req, res) => res.json({ message: 'getOrders OK' });
export const getOrderByTable = (req, res) => res.json({ message: 'getOrderByTable OK' });
export const createOrder = (req, res) => res.json({ message: 'createOrder OK' });
export const cancelOrderItem = (req, res) => res.json({ message: 'cancelOrderItem OK' });
export const cancelOrder = (req, res) => res.json({ message: 'cancelOrder OK' });

export const applyDiscount = (req, res) => res.json({ message: 'applyDiscount OK' });
export const completeOrder = (req, res) => res.json({ message: 'completeOrder OK' });
