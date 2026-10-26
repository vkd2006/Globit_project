import mongoose from 'mongoose'

const equipmentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ['laptop', 'monitor', 'phone', 'keyboard', 'mouse', 'headset', 'other'],
            default: 'laptop',
        },
        serialNumber: { type: String, required: true, unique: true, trim: true },
        status: {
            type: String,
            enum: ['available', 'assigned', 'in_transit', 'retired'],
            default: 'available',
        },
        country: { type: String, trim: true },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
)

export default mongoose.model('Equipment', equipmentSchema)