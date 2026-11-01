import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import EquipmentReturn from '../models/EquipmentReturn.js'
import Equipment from '../models/Equipment.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()
router.use(protect)

const objectId = z.string().refine((value) => mongoose.isValidObjectId(value), 'Invalid id')
const conditionEnum = z.enum(['good', 'damaged'])

const createSchema = z.object({
    equipment: objectId,
    reason: z.string().trim().optional(),
    condition: conditionEnum.optional(),
})

const statusSchema = z.object({
    status: z.enum(['received', 'completed', 'cancelled']),
    condition: conditionEnum.optional(),
    notes: z.string().trim().optional(),
})

// Which status changes are allowed from each status
const allowedMoves = {
    requested: ['received', 'cancelled'],
    received: ['completed', 'cancelled'],
}

const populateFields = [
    { path: 'equipment', select: 'name type serialNumber' },
    { path: 'employee', select: 'name email department country' },
]

router.get('/', async (req, res) => {
    const returns = await EquipmentReturn.find().sort({ createdAt: -1 }).populate(populateFields)
    res.json({ returns })
})

router.post('/', restrictTo('admin', 'manager'), async (req, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }
    const { equipment, reason, condition } = parsed.data

    const item = await Equipment.findById(equipment)
    if (!item) return res.status(404).json({ message: 'Equipment not found' })
    if (item.status !== 'assigned' || !item.assignedTo) {
        return res.status(409).json({ message: 'Only equipment assigned to an employee can be returned' })
    }

    const alreadyOpen = await EquipmentReturn.exists({
        equipment,
        status: { $in: ['requested', 'received'] },
    })
    if (alreadyOpen) {
        return res.status(409).json({ message: 'A return is already open for this equipment' })
    }

    const equipmentReturn = await EquipmentReturn.create({
        equipment,
        employee: item.assignedTo,
        reason,
        condition,
    })
    await equipmentReturn.populate(populateFields)
    res.status(201).json({ equipmentReturn })
})

router.patch('/:id/status', restrictTo('admin', 'manager'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid return id' })
    }
    const parsed = statusSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }

    const equipmentReturn = await EquipmentReturn.findById(req.params.id)
    if (!equipmentReturn) return res.status(404).json({ message: 'Return not found' })

    const allowed = allowedMoves[equipmentReturn.status] || []
    if (!allowed.includes(parsed.data.status)) {
        return res.status(409).json({
            message: `A ${equipmentReturn.status} return cannot be changed to ${parsed.data.status}`,
        })
    }

    equipmentReturn.status = parsed.data.status
    if (parsed.data.condition) equipmentReturn.condition = parsed.data.condition
    if (parsed.data.notes) equipmentReturn.notes = parsed.data.notes

    if (parsed.data.status === 'completed') {
        equipmentReturn.completedAt = new Date()
        await Equipment.findByIdAndUpdate(equipmentReturn.equipment, {
            status: equipmentReturn.condition === 'damaged' ? 'retired' : 'available',
            assignedTo: null,
        })
    }

    await equipmentReturn.save()
    await equipmentReturn.populate(populateFields)
    res.json({ equipmentReturn })
})

router.delete('/:id', restrictTo('admin'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid return id' })
    }
    const equipmentReturn = await EquipmentReturn.findById(req.params.id)
    if (!equipmentReturn) return res.status(404).json({ message: 'Return not found' })
    if (equipmentReturn.status === 'requested' || equipmentReturn.status === 'received') {
        return res.status(409).json({ message: 'Cancel or complete this return before deleting it' })
    }
    await equipmentReturn.deleteOne()
    res.json({ message: 'Return deleted' })
})

export default router