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
    status: z.enum(['available', 'assigned', 'in_transit', 'retired']).optional(),
    country: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    assignedTo: z.string().trim().nullable().optional(),
})

const equipmentUpdateSchema = equipmentSchema.partial()

router.get('/', async (req, res) => {
    try {
        const items = await Equipment.find()
            .populate('assignedTo', 'name email department country')
            .sort({ createdAt: -1 })
        res.json({ items })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch equipment' })
    }
})

router.post('/', restrictTo('admin', 'manager'), async (req, res) => {
    const parsed = equipmentSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }
    try {
        const data = { ...parsed.data }
        // If assignedTo is provided and non-empty, auto-set status to 'assigned'
        if (data.assignedTo && data.assignedTo !== '') {
            data.status = 'assigned'
        } else {
            data.assignedTo = null
            if (!data.status) {
                data.status = 'available'
            }
        }

        const item = await Equipment.create(data)
        const populatedItem = await Equipment.findById(item._id).populate(
            'assignedTo',
            'name email department country'
        )
        res.status(201).json({ item: populatedItem })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'An item with this serial number already exists' })
        }
        res.status(500).json({ message: err.message || 'Failed to create equipment' })
    }
})

router.put('/:id', restrictTo('admin', 'manager'), async (req, res) => {
    const parsed = equipmentUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }
    try {
        const data = { ...parsed.data }
        
        // Handle assignment status logic
        if (data.assignedTo !== undefined) {
            if (data.assignedTo && data.assignedTo !== '') {
                data.status = 'assigned'
            } else {
                data.assignedTo = null
                // If unassigned and no explicit status provided, check or reset to available
                if (!data.status || data.status === 'assigned') {
                    data.status = 'available'
                }
            }
        }

        const item = await Equipment.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true,
        }).populate('assignedTo', 'name email department country')

        if (!item) {
            return res.status(404).json({ message: 'Equipment not found' })
        }

        res.json({ item })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'An item with this serial number already exists' })
        }
        res.status(500).json({ message: err.message || 'Failed to update equipment' })
    }
})

router.delete('/:id', restrictTo('admin', 'manager'), async (req, res) => {
    try {
        const item = await Equipment.findByIdAndDelete(req.params.id)
        if (!item) {
            return res.status(404).json({ message: 'Equipment not found' })
        }
        res.json({ message: 'Equipment deleted successfully', id: req.params.id })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to delete equipment' })
    }
})

export default router
