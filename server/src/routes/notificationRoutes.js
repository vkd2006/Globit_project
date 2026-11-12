import { Router } from 'express'
import Notification from '../models/Notification.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)

// List all notifications for current user
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30)
        res.json({ notifications })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch notifications' })
    }
})

// Mark single notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true },
            { new: true }
        )
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' })
        }
        res.json({ notification })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to update notification' })
    }
})

// Mark all notifications as read for current user
router.patch('/read-all', async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
        res.json({ message: 'All notifications marked as read' })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to mark notifications' })
    }
})

export default router
