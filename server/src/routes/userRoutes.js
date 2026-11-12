import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import User from '../models/User.js'
import Employee from '../models/Employee.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()
router.use(protect, restrictTo('admin'))

const roleEnum = z.enum(['admin', 'manager', 'employee'])

const createSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Enter a valid email').toLowerCase(),
    password: z.string().min(8, 'The password must be at least 8 characters'),
    role: roleEnum.optional().default('employee'),
    department: z.string().trim().optional().default(''),
    country: z.string().trim().optional().default(''),
})

const updateSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').optional(),
    role: roleEnum.optional(),
    active: z.boolean().optional(),
})

const passwordSchema = z.object({
    password: z.string().min(8, 'The password must be at least 8 characters'),
})

function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active !== false,
        createdAt: user.createdAt,
    }
}

router.get('/', async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ users: users.map(publicUser) })
})

router.post('/', async (req, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }
    try {
        const { department, country, ...userData } = parsed.data
        const user = await User.create(userData)

        // If the created user is an employee, automatically ensure they exist in Employee list!
        if (user.role === 'employee') {
            const existingEmp = await Employee.findOne({ email: user.email.toLowerCase() })
            if (!existingEmp) {
                await Employee.create({
                    name: user.name,
                    email: user.email.toLowerCase(),
                    department: department || '',
                    country: country || '',
                    status: 'active',
                })
            }
        }

        res.status(201).json({ user: publicUser(user) })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A user with this email already exists' })
        }
        throw err
    }
})

router.patch('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user id' })
    }
    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }

    const target = await User.findById(req.params.id)
    if (!target) return res.status(404).json({ message: 'User not found' })

    // Never let the workspace end up with no active admin
    const losingAdmin =
        target.role === 'admin' &&
        ((parsed.data.role && parsed.data.role !== 'admin') || parsed.data.active === false)
    if (losingAdmin) {
        if (target._id.equals(req.user._id)) {
            return res.status(400).json({ message: 'You cannot remove your own admin access' })
        }
        const otherAdmins = await User.countDocuments({
            role: 'admin',
            active: { $ne: false },
            _id: { $ne: target._id },
        })
        if (otherAdmins === 0) {
            return res.status(409).json({ message: 'At least one active admin is required' })
        }
    }

    const user = await User.findByIdAndUpdate(req.params.id, parsed.data, {
        new: true,
        runValidators: true,
    })

    // If name changed or user deactivated, sync with Employee record
    if (parsed.data.name || parsed.data.active !== undefined) {
        const empUpdate = {}
        if (parsed.data.name) empUpdate.name = parsed.data.name
        if (parsed.data.active === false) empUpdate.status = 'inactive'
        await Employee.findOneAndUpdate({ email: target.email }, empUpdate)
    }

    res.json({ user: publicUser(user) })
})

router.patch('/:id/password', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user id' })
    }
    const parsed = passwordSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }
    const user = await User.findById(req.params.id).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.password = parsed.data.password
    await user.save()
    res.json({ message: 'Password updated' })
})

export default router
