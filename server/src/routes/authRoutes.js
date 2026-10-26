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

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ message: 'Enter a valid email and password' })

    const { email, password } = parsed.data
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Incorrect email or password' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.cookie('token', token, cookieOptions)
    res.json({
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
    })
})

router.get('/me', protect, (req, res) => {
    const { _id, name, email, role } = req.user
    res.json({ user: { id: _id, name, email, role } })
})

router.post('/logout', (req, res) => {
    res.clearCookie('token', { ...cookieOptions, maxAge: undefined })
    res.json({ message: 'Logged out' })
})

export default router