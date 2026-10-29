import mongoose from 'mongoose'

const requestSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        item: { type: String, required: true, trim: true },
        itemType: {
            type: String,
            enum: ['laptop', 'monitor', 'phone', 'keyboard', 'mouse', 'headset', 'other'],
            default: 'laptop',
        },
        reason: { type: String, trim: true, default: '' },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'fulfilled'],
            default: 'pending',
        },
        date: { type: String },
    },
    { timestamps: true }
)

export default mongoose.model('Request', requestSchema)
