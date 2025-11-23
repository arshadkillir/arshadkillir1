export const placeholder = (req, res) => {
  return res.json({ message: 'userController.ts OK' });
};
export const getAllUsers = (req, res) => res.json({ message: 'getAllUsers OK' });
export const updateUser = (req, res) => res.json({ message: 'updateUser OK' });
export const updateUserStatus = (req, res) => res.json({ message: 'updateUserStatus OK' });
export const resetPassword = (req, res) => res.json({ message: 'resetPassword OK' });
export const getUserById = (req, res) => res.json({ message: 'getUserById OK' });
export const deleteUser = (req, res) => res.json({ message: 'deleteUser OK' });
