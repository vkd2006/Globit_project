import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { Router } from 'express'
import { z } from 'zod'
import Request from '../models/Request.js'
import Employee from '../models/Employee.js'
import Equipment from '../models/Equipment.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = Router()
router.use(protect)

const requestCreateSchema = z.object({
    employee: z.string().trim().min(1, 'Employee is required'),
    equipment: z.string().trim().nullable().optional(),
    item: z.string().trim().min(1, 'Equipment item is required'),
    itemType: z.enum(['laptop', 'monitor', 'phone', 'keyboard', 'mouse', 'headset', 'other']).optional().default('laptop'),
    reason: z.string().trim().optional().default(''),
    rejectionReason: z.string().trim().optional().default(''),
    status: z.enum(['pending', 'approved', 'rejected', 'fulfilled']).optional().default('pending'),
})

const requestUpdateSchema = z.object({
    equipment: z.string().trim().nullable().optional(),
    item: z.string().trim().min(1).optional(),
    itemType: z.enum(['laptop', 'monitor', 'phone', 'keyboard', 'mouse', 'headset', 'other']).optional(),
    reason: z.string().trim().optional(),
    rejectionReason: z.string().trim().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'fulfilled']).optional(),
})

// List all requests (scoped for employees)
router.get('/', async (req, res) => {
    try {
        const { search, status } = req.query
        const query = {}

        if (status) {
            query.status = status
        }

        // If employee role, only show requests submitted by this employee!
        if (req.user.role === 'employee') {
            const employee = await Employee.findOne({ email: req.user.email.toLowerCase() })
            if (!employee) {
                return res.json({ requests: [], count: 0 })
            }
            query.employee = employee._id
        }

        const items = await Request.find(query)
            .populate('employee', 'name email department country')
            .populate('equipment', 'name type serialNumber status country').populate('shipment', 'trackingNumber carrier status')
            .sort({ createdAt: -1 })

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

// Create request (employees can request for themselves, admins/managers for anyone)
router.post('/', async (req, res) => {
    let reqData = { ...req.body }

    // If an employee is submitting the request, enforce employee ID to their own profile!
    if (req.user.role === 'employee') {
        let employee = await Employee.findOne({ email: req.user.email.toLowerCase() })
        if (!employee) {
            employee = await Employee.create({
                name: req.user.name,
                email: req.user.email.toLowerCase(),
                status: 'active',
            })
        }
        reqData.employee = employee._id.toString()
        reqData.status = 'pending'
    }

    const parsed = requestCreateSchema.safeParse(reqData)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }

    if (parsed.data.equipment) {
        const chosen = await Equipment.findById(parsed.data.equipment)
        if (!chosen) {
            return res.status(404).json({ message: 'Selected equipment not found' })
        }
        if (chosen.status !== 'available') {
            return res.status(400).json({
                message: `This equipment is no longer available (currently ${chosen.status}). Please select another device.`
            })
        }
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

        // Notify admins
        try {
            const admins = await User.find({ role: 'admin' })
            for (const admin of admins) {
                await Notification.create({
                    user: admin._id,
                    title: 'New Equipment Request 📋',
                    message: `${employeeExists.name} requested ${item.item}.`,
                    type: 'request',
                    targetTab: 'Requests',
                })
            }
        } catch (e) {}

        const populated = await Request.findById(item._id)
            .populate('employee', 'name email department country')
            .populate('equipment', 'name type serialNumber status country').populate('shipment', 'trackingNumber carrier status')

        res.status(201).json({ request: populated })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to create request' })
    }
})

// Update request (e.g. approve, reject, fulfill) - restricted to admins and managers
router.put('/:id', restrictTo('admin', 'manager'), async (req, res) => {
    const parsed = requestUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message })
    }

    try {
        const existing = await Request.findById(req.params.id)
        if (!existing) {
            return res.status(404).json({ message: 'Request not found' })
        }

        const item = await Request.findByIdAndUpdate(req.params.id, parsed.data, {
            new: true,
            runValidators: true,
        })
            .populate('employee', 'name email department country')
            .populate('equipment', 'name type serialNumber status country').populate('shipment', 'trackingNumber carrier status')

        // When approved or fulfilled, check availability, auto-assign, and auto-cancel competing requests!
        const targetEquipmentId = parsed.data.equipment || item.equipment?._id || item.equipment
        if ((parsed.data.status === 'approved' || parsed.data.status === 'fulfilled') && targetEquipmentId) {
            const currentEquip = await Equipment.findById(targetEquipmentId)
            const targetEmployeeId = (item.employee?._id || item.employee).toString()

            if (currentEquip && currentEquip.assignedTo && currentEquip.assignedTo.toString() !== targetEmployeeId) {
                return res.status(409).json({
                    message: 'Cannot approve request: This equipment has already been assigned to another employee.'
                })
            }

            await Equipment.findByIdAndUpdate(targetEquipmentId, {
                status: 'assigned',
                assignedTo: targetEmployeeId,
            })

            // Notify approved employee
            try {
                const empUser = await User.findOne({ email: item.employee?.email?.toLowerCase() })
                if (empUser) {
                    await Notification.create({
                        user: empUser._id,
                        title: 'Request Approved! 🎉',
                        message: `Your request for ${item.item} has been approved and assigned to you.`,
                        type: 'request',
                        targetTab: 'Requests',
                    })
                }
            } catch (e) {}

            // AUTO-CHECKER: Find all OTHER pending requests for this same equipment and cancel them
            const assignedEmpName = item.employee?.name || 'another employee'
            const conflicting = await Request.find({
                _id: { $ne: item._id },
                equipment: targetEquipmentId,
                status: 'pending',
            }).populate('employee', 'name email')

            await Request.updateMany(
                {
                    _id: { $ne: item._id },
                    equipment: targetEquipmentId,
                    status: 'pending',
                },
                {
                    status: 'rejected',
                    rejectionReason: `Cancelled automatically: Equipment was assigned to ${assignedEmpName}.`,
                }
            )

            // Notify each conflicting employee
            for (const cReq of conflicting) {
                try {
                    const cUser = await User.findOne({ email: cReq.employee?.email?.toLowerCase() })
                    if (cUser) {
                        await Notification.create({
                            user: cUser._id,
                            title: 'Request Cancelled (Auto-Conflict) ⚠️',
                            message: `Your request for ${cReq.item} was cancelled because it was assigned to ${assignedEmpName}.`,
                            type: 'request',
                            targetTab: 'Requests',
                        })
                    }
                } catch (e) {}
            }
        } else if (parsed.data.status === 'rejected' && targetEquipmentId) {
            // If rejected and currently assigned to this user, reset to available
            const currentEquip = await Equipment.findById(targetEquipmentId)
            const targetEmployeeId = (item.employee?._id || item.employee).toString()
            if (currentEquip && currentEquip.assignedTo?.toString() === targetEmployeeId) {
                await Equipment.findByIdAndUpdate(targetEquipmentId, {
                    status: 'available',
                    assignedTo: null,
                })
            }
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
