import crypto from 'crypto'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = Router()

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'The new password must be at least 8 characters'),
})

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const demoEmail = process.env.DEMO_EMAIL || 'demo@globit.com'

router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ message: 'Enter a valid email and password' })

    const { email, password } = parsed.data
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Incorrect email or password' })
    }
    if (user.active === false) {
        return res.status(403).json({ message: 'This account has been deactivated. Contact an admin.' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.cookie('token', token, cookieOptions)
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
})

// Signs a visitor in to the read-only demo account, with no password
router.post('/demo', async (req, res) => {
    let user = await User.findOne({ email: demoEmail })
    if (!user) {
        user = await User.create({
            name: 'Demo Visitor',
            email: demoEmail,
            password: crypto.randomBytes(24).toString('hex'),
            role: 'viewer',
        })
    }
    // Never use this route to sign in to a real account
    if (user.role !== 'viewer' || user.active === false) {
        return res.status(403).json({ message: 'The demo is not available right now' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' })
    res.cookie('token', token, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 })
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
})

router.get('/me', protect, (req, res) => {
    const { _id, name, email, role } = req.user
    res.json({ user: { id: _id, name, email, role } })
})

router.post('/change-password', protect, async (req, res) => {
    const parsed = passwordSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.matchPassword(parsed.data.currentPassword))) {
        return res.status(401).json({ message: 'Your current password is incorrect' })
    }
    user.password = parsed.data.newPassword
    await user.save()
    res.json({ message: 'Password updated' })
})

router.post('/logout', (req, res) => {
    res.clearCookie('token', { ...cookieOptions, maxAge: undefined })
    res.json({ message: 'Logged out' })
})

export default router