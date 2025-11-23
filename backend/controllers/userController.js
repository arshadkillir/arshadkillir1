import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';

// GET /api/users
// Fetches all users with selected fields for security and privacy.
export const getAllUsers = async (req, res) => {
  // In a real app, you would add middleware here to ensure only an ADMIN can access this.
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        outlet: { select: { name: true } },
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// PUT /api/users/:id
// Updates a user's role.
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'A role is required.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(`Failed to update role for user ${id}:`, error);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
};

// DELETE /api/users/:id
// Deactivates a user account.
export const deactivateUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.update({
      where: { id: Number(id) },
      // We set isActive to false instead of deleting to preserve historical data.
      data: { isActive: false },
    });
    res.status(204).send(); // 204 No Content is appropriate for a successful deletion/deactivation
  } catch (error) {
    console.error(`Failed to deactivate user ${id}:`, error);
    res.status(500).json({ error: 'Failed to deactivate user.' });
  }
};

// PUT /api/users/:id/reactivate
// Reactivates a user account.
export const reactivateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: true },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(`Failed to reactivate user ${id}:`, error);
    res.status(500).json({ error: 'Failed to reactivate user.' });
  }
};

// PUT /api/users/:id/reset-password
// Resets a user's password.
export const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: Number(id) },
      data: { passwordHash },
    });
    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error(`Failed to reset password for user ${id}:`, error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};