import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const readOnlyMethods = ['GET', 'HEAD', 'OPTIONS']

export async function protect(req, res, next) {
    try {
        const token = req.cookies.token
        if (!token) return res.status(401).json({ message: 'Not authenticated' })
        const { id } = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(id)
        if (!user || user.active === false) {
            return res.status(401).json({ message: 'This account is not available' })
        }
        // The demo account can look but never change anything
        if (user.role === 'viewer' && !readOnlyMethods.includes(req.method)) {
            return res.status(403).json({ message: 'The demo account is read-only' })
        }
        req.user = user
        next()
    } catch {
        res.status(401).json({ message: 'Invalid or expired session' })
    }
}

export const restrictTo = (...roles) => (req, res, next) =>
    roles.includes(req.user.role)
        ? next()
        : res.status(403).json({ message: 'You do not have permission' })