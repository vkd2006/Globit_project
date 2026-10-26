import { Router } from 'express'
import { z } from 'zod'
import Equipment from '../models/Equipment.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()
router.use(protect)

const equipmentSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    type: z.enum(['laptop', 'monitor', 'phone', 'keyboard', 'mouse', 'headset', 'other']),
    serialNumber: z.string().trim().min(1, 'Serial number is required'),
    country: z.string().trim().optional(),
    notes: z.string().trim().optional(),
})

router.get('/', async (req, res) => {
    const items = await Equipment.find().sort({ createdAt: -1 })
    res.json({ items })
})

router.post('/', restrictTo('admin', 'manager'), async (req, res) => {
    const parsed = equipmentSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }
    try {
        const item = await Equipment.create(parsed.data)
        res.status(201).json({ item })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'An item with this serial number already exists' })
        }
        throw err
    }
})

export default router