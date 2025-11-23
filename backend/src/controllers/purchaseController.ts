export const placeholder = (req, res) => {
  return res.json({ message: 'purchaseController.ts OK' });
};
export const getPurchases = (req, res) => res.json({ message: 'getPurchases OK' });
export const createPurchase = (req, res) => res.json({ message: 'createPurchase OK' });
