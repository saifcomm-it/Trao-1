import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/userModel';
import { config } from '../Config/env';
import { sendPasswordResetEmail } from '../helpers/email/email-service';

export const userRoutes = Router();

export function authenticate(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, config.jwtSecret);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session token' });
  }
}

export function optionalAuthenticate(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, config.jwtSecret);
      (req as any).user = decoded;
    } catch {
    }
  }
  next();
}

userRoutes.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name, password, targetRole, seniority } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.name = name;
        if (targetRole) user.targetRole = targetRole;
        if (seniority) user.seniority = seniority;
        if (password) user.password = password;
        await user.save();
      } else {
        user = await User.create({
          email: email.toLowerCase(),
          name,
          password,
          targetRole: targetRole || 'Candidate',
          seniority: seniority || 'Mid-Level'
        });
      }
    } catch (dbErr: any) {
      return res.status(500).json({ message: dbErr.message || 'Failed to save candidate to database' });
    }

    const token = jwt.sign({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      targetRole: user.targetRole,
      seniority: user.seniority
    }, config.jwtSecret, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        targetRole: user.targetRole || '',
        seniority: user.seniority || ''
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

userRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Enter your correct email or password' });
    }

    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: 'Enter your correct email or password' });
      }
      if (user.password && password && user.password !== password) {
        return res.status(401).json({ message: 'Enter your correct email or password' });
      }
    } catch (dbErr: any) {
      return res.status(500).json({ message: dbErr.message || 'Database error during sign in' });
    }

    const token = jwt.sign({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      targetRole: user.targetRole,
      seniority: user.seniority
    }, config.jwtSecret, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        targetRole: user.targetRole || '',
        seniority: user.seniority || ''
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
});

userRoutes.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        targetRole: user.targetRole || '',
        seniority: user.seniority || ''
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch user' });
  }
});


userRoutes.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, targetRole, seniority, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (email && typeof email === 'string' && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== user.email) {
        const existing = await User.findOne({ email: cleanEmail });
        if (existing && existing._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: 'This email is already in use by another account.' });
        }
        user.email = cleanEmail;
      }
    }

    if (targetRole !== undefined && typeof targetRole === 'string') {
      user.targetRole = targetRole.trim();
    }

    if (seniority !== undefined && typeof seniority === 'string') {
      user.seniority = seniority.trim();
    }


    if (newPassword && typeof newPassword === 'string' && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
      }
      if (user.password && currentPassword && user.password !== currentPassword) {
        return res.status(400).json({ message: 'Current password does not match.' });
      }
      user.password = newPassword.trim();
    }

    await user.save();

    const token = jwt.sign({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      targetRole: user.targetRole,
      seniority: user.seniority
    }, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Profile and account details updated successfully in the database!',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        targetRole: user.targetRole || '',
        seniority: user.seniority || ''
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to update profile' });
  }
});


userRoutes.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Please provide a valid registered email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address. Please register first.' });
    }


    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();


    const clientOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer as string).origin : '') || 'http://localhost:3000';
    const resetLink = `${clientOrigin}/reset-password?token=${resetToken}`;

    console.log(`[Auth] Password reset requested for ${cleanEmail}. Sending reset email...`);
    await sendPasswordResetEmail(cleanEmail, user.name || 'Candidate', resetLink);

    return res.json({
      success: true,
      message: 'A password reset link has been sent to your email address.',
      email: cleanEmail
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to process password reset request.' });
  }
});

// Reset Password with Token
userRoutes.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing reset token.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset link is invalid or has expired. Please request a new one.' });
    }

    // Update password in database
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log(`[Auth] Password successfully updated in database for user: ${user.email}`);

    return res.json({
      success: true,
      message: 'Your password has been changed successfully in the database. You can now log in.'
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to reset password.' });
  }
});

export const authRouter = userRoutes;
export default userRoutes;
