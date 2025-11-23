export const placeholder = (req, res) => {
  return res.json({ message: 'outletController.ts OK' });
};
export const getOutlets = (req, res) => res.json({ message: 'getOutlets OK' });
export const addOutlet = (req, res) => res.json({ message: 'addOutlet OK' });
export const updateOutlet = (req, res) => res.json({ message: 'updateOutlet OK' });
export const deleteOutlet = (req, res) => res.json({ message: 'deleteOutlet OK' });
