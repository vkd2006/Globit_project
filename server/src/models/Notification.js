import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ['request', 'shipment', 'return', 'system'],
            default: 'system',
        },
        targetTab: { type: String, default: 'Requests' },
        read: { type: Boolean, default: false },
        metadata: { type: Object, default: {} },
    },
    { timestamps: true }
)

export default mongoose.model('Notification', notificationSchema)
