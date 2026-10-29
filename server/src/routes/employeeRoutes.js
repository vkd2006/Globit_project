import { Router } from 'express'
import { z } from 'zod'
import Employee from '../models/Employee.js'
import Equipment from '../models/Equipment.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()
router.use(protect)

const employeeCreateSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Valid email is required').toLowerCase(),
    department: z.string().trim().optional().default(''),
    country: z.string().trim().optional().default(''),
    address: z.string().trim().optional().default(''),
    status: z.enum(['active', 'inactive', 'on_leave']).optional().default('active'),
})

const employeeUpdateSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').optional(),
    email: z.string().trim().email('Valid email is required').toLowerCase().optional(),
    department: z.string().trim().optional(),
    country: z.string().trim().optional(),
    address: z.string().trim().optional(),
    status: z.enum(['active', 'inactive', 'on_leave']).optional(),
})

// List all employees (with optional search query)
router.get('/', async (req, res) => {
    try {
        const { search, status } = req.query
        const query = {}

        if (status) {
            query.status = status
        }

        if (search) {
            const regex = new RegExp(search.trim(), 'i')
            query.$or = [
                { name: regex },
                { email: regex },
                { department: regex },
                { country: regex },
                { address: regex },
            ]
        }

        const employees = await Employee.find(query).sort({ createdAt: -1 })
        res.json({ employees, count: employees.length })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch employees' })
    }
})

// Get single employee
router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' })
        }
        res.json({ employee })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch employee' })
    }
})

// Create employee
router.post('/', restrictTo('admin', 'manager'), async (req, res) => {
    const parsed = employeeCreateSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }

    try {
        const employee = await Employee.create(parsed.data)
        res.status(201).json({ employee })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'An employee with this email already exists' })
        }
        res.status(500).json({ message: err.message || 'Failed to create employee' })
    }
})

// Update employee
router.put('/:id', restrictTo('admin', 'manager'), async (req, res) => {
    const parsed = employeeUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }

    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            parsed.data,
            { new: true, runValidators: true }
        )
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' })
        }
        res.json({ employee })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'An employee with this email already exists' })
        }
        res.status(500).json({ message: err.message || 'Failed to update employee' })
    }
})

// Delete employee
router.delete('/:id', restrictTo('admin', 'manager'), async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id)
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' })
        }

        // Unassign equipment currently assigned to this employee
        await Equipment.updateMany(
            { assignedTo: req.params.id },
            { $set: { assignedTo: null, status: 'available' } }
        )

        res.json({ message: 'Employee deleted successfully', id: req.params.id })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to delete employee' })
    }
})

export default router
