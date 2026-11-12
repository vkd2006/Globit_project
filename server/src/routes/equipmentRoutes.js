import { Router } from 'express'
import { z } from 'zod'
import Equipment from '../models/Equipment.js'
import Employee from '../models/Employee.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()
router.use(protect)

const equipmentSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    type: z.enum(['laptop', 'monitor', 'phone', 'keyboard', 'mouse', 'headset', 'other']),
    serialNumber: z.string().trim().optional().default(''),
    quantity: z.coerce.number().int().min(1).max(100).optional().default(1),
    status: z.enum(['available', 'assigned', 'in_transit', 'retired']).optional(),
    country: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    assignedTo: z.string().trim().nullable().optional(),
})

const equipmentUpdateSchema = equipmentSchema.partial()

router.get('/', async (req, res) => {
    try {
        let query = {}
        // If explicitly requesting available inventory (for requesting a device)
        if (req.query.status === 'available') {
            query.status = 'available'
        } else if (req.user.role === 'employee') {
            // For employee default view, only show equipment assigned to them
            const employee = await Employee.findOne({ email: req.user.email.toLowerCase() })
            if (!employee) {
                return res.json({ items: [] })
            }
            query.assignedTo = employee._id
        } else {
            if (req.query.status) {
                query.status = req.query.status
            }
        }

        const items = await Equipment.find(query)
            .populate('assignedTo', 'name email department country')
            .sort({ createdAt: -1 })
        res.json({ items })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch equipment' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const item = await Equipment.findById(req.params.id).populate('assignedTo', 'name email department country')
        if (!item) {
            return res.status(404).json({ message: 'Equipment not found' })
        }
        res.json({ item })
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
        const { quantity = 1, ...data } = parsed.data
        if (data.assignedTo && data.assignedTo !== '') {
            data.status = 'assigned'
        } else {
            data.assignedTo = null
            if (!data.status) {
                data.status = 'available'
            }
        }

        const createdItems = []
        const baseSerial = data.serialNumber ? data.serialNumber.trim() : ''

        if (quantity > 1) {
            const prefix = baseSerial || `${data.type.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-5)}`
            for (let i = 1; i <= quantity; i++) {
                const sn = `${prefix}-${String(i).padStart(2, '0')}`
                const item = await Equipment.create({
                    ...data,
                    serialNumber: sn,
                    notes: data.notes ? `${data.notes} (Unit ${i}/${quantity})` : `Batch inventory unit ${i}/${quantity}`,
                })
                createdItems.push(item)
            }
            const populated = await Equipment.find({ _id: { $in: createdItems.map(c => c._id) } })
                .populate('assignedTo', 'name email department country')
            return res.status(201).json({ item: populated[0], items: populated, count: populated.length })
        } else {
            if (!data.serialNumber || data.serialNumber.trim() === '') {
                data.serialNumber = `${data.type.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
            }
            const item = await Equipment.create(data)
            const populatedItem = await Equipment.findById(item._id).populate(
                'assignedTo',
                'name email department country'
            )
            return res.status(201).json({ item: populatedItem, items: [populatedItem], count: 1 })
        }
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
