import { Router } from 'express'
import { z } from 'zod'
import Request from '../models/Request.js'
import Employee from '../models/Employee.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()
router.use(protect)

const requestCreateSchema = z.object({
    employee: z.string().trim().min(1, 'Employee is required'),
    item: z.string().trim().min(1, 'Equipment item is required'),
    itemType: z.enum(['laptop', 'monitor', 'phone', 'keyboard', 'mouse', 'headset', 'other']).optional().default('laptop'),
    reason: z.string().trim().optional().default(''),
    status: z.enum(['pending', 'approved', 'rejected', 'fulfilled']).optional().default('pending'),
})

const requestUpdateSchema = z.object({
    item: z.string().trim().min(1).optional(),
    itemType: z.enum(['laptop', 'monitor', 'phone', 'keyboard', 'mouse', 'headset', 'other']).optional(),
    reason: z.string().trim().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'fulfilled']).optional(),
})

// List all requests
router.get('/', async (req, res) => {
    try {
        const { search, status } = req.query
        const query = {}

        if (status) {
            query.status = status
        }

        const items = await Request.find(query)
            .populate('employee', 'name email department country')
            .sort({ createdAt: -1 })

        // If search was passed, filter in-memory or by regex
        const filtered = search
            ? items.filter((r) => {
                  const s = search.toLowerCase()
                  const empName = r.employee?.name || ''
                  return (
                      empName.toLowerCase().includes(s) ||
                      r.item.toLowerCase().includes(s) ||
                      (r.reason && r.reason.toLowerCase().includes(s)) ||
                      r.status.toLowerCase().includes(s)
                  )
              })
            : items

        res.json({ requests: filtered, count: filtered.length })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch requests' })
    }
})

// Create request
router.post('/', async (req, res) => {
    const parsed = requestCreateSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }

    try {
        const employeeExists = await Employee.findById(parsed.data.employee)
        if (!employeeExists) {
            return res.status(404).json({ message: 'Selected employee does not exist' })
        }

        const dateStr = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })

        const item = await Request.create({
            ...parsed.data,
            date: dateStr,
        })

        const populated = await Request.findById(item._id).populate(
            'employee',
            'name email department country'
        )

        res.status(201).json({ request: populated })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to create request' })
    }
})

// Update request (e.g. approve, reject, fulfill)
router.put('/:id', async (req, res) => {
    const parsed = requestUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }

    try {
        const item = await Request.findByIdAndUpdate(req.params.id, parsed.data, {
            new: true,
            runValidators: true,
        }).populate('employee', 'name email department country')

        if (!item) {
            return res.status(404).json({ message: 'Request not found' })
        }

        res.json({ request: item })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to update request' })
    }
})

// Delete request
router.delete('/:id', restrictTo('admin', 'manager'), async (req, res) => {
    try {
        const item = await Request.findByIdAndDelete(req.params.id)
        if (!item) {
            return res.status(404).json({ message: 'Request not found' })
        }
        res.json({ message: 'Request deleted successfully', id: req.params.id })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to delete request' })
    }
})

export default router
