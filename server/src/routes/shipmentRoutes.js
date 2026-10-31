import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import Shipment from '../models/Shipment.js'
import Equipment from '../models/Equipment.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()
router.use(protect)

const objectId = z.string().refine((value) => mongoose.isValidObjectId(value), 'Invalid id')

const createSchema = z.object({
    equipment: objectId,
    employee: objectId,
    carrier: z.string().trim().optional(),
    trackingNumber: z.string().trim().optional(),
    destinationCountry: z.string().trim().optional(),
})

const statusSchema = z.object({
    status: z.enum(['processing', 'in_transit', 'delivered', 'cancelled']),
    note: z.string().trim().optional(),
})

const populateFields = [
    { path: 'equipment', select: 'name type serialNumber' },
    { path: 'employee', select: 'name email department country' },
]

// Keeps the equipment record in step with its shipment
async function syncEquipment(shipment) {
    const changes = {
        processing: { status: 'in_transit', assignedTo: shipment.employee },
        in_transit: { status: 'in_transit', assignedTo: shipment.employee },
        delivered: { status: 'assigned', assignedTo: shipment.employee },
        cancelled: { status: 'available', assignedTo: null },
    }
    await Equipment.findByIdAndUpdate(shipment.equipment, changes[shipment.status])
}

router.get('/', async (req, res) => {
    const shipments = await Shipment.find().sort({ createdAt: -1 }).populate(populateFields)
    res.json({ shipments })
})

router.post('/', restrictTo('admin', 'manager'), async (req, res) => {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }
    const { equipment, employee } = parsed.data

    const item = await Equipment.findById(equipment)
    if (!item) return res.status(404).json({ message: 'Equipment not found' })
    if (item.status === 'in_transit' || item.status === 'retired') {
        return res.status(409).json({ message: `This equipment is ${item.status.replace('_', ' ')} and cannot be shipped` })
    }

    const employeeExists = await mongoose.model('Employee').exists({ _id: employee })
    if (!employeeExists) return res.status(404).json({ message: 'Employee not found' })

    const shipment = await Shipment.create({
        ...parsed.data,
        timeline: [{ status: 'processing', note: 'Shipment created' }],
    })
    await syncEquipment(shipment)
    await shipment.populate(populateFields)
    res.status(201).json({ shipment })
})

router.patch('/:id/status', restrictTo('admin', 'manager'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid shipment id' })
    }
    const parsed = statusSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }

    const shipment = await Shipment.findById(req.params.id)
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' })
    if (shipment.status === 'delivered' || shipment.status === 'cancelled') {
        return res.status(409).json({ message: `This shipment is already ${shipment.status}` })
    }

    shipment.status = parsed.data.status
    shipment.timeline.push({ status: parsed.data.status, note: parsed.data.note || '' })
    await shipment.save()
    await syncEquipment(shipment)
    await shipment.populate(populateFields)
    res.json({ shipment })
})

router.delete('/:id', restrictTo('admin'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid shipment id' })
    }
    const shipment = await Shipment.findById(req.params.id)
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' })
    if (shipment.status === 'processing' || shipment.status === 'in_transit') {
        return res.status(409).json({ message: 'Cancel this shipment before deleting it' })
    }
    await shipment.deleteOne()
    res.json({ message: 'Shipment deleted' })
})

export default router