import mongoose from 'mongoose'

const equipmentReturnSchema = new mongoose.Schema(
    {
        equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
        reason: { type: String, trim: true, default: '' },
        collectionAddress: { type: String, trim: true, default: '' },
        condition: { type: String, enum: ['good', 'damaged'], default: 'good' },
        status: {
            type: String,
            enum: ['requested', 'received', 'completed', 'cancelled'],
            default: 'requested',
        },
        notes: { type: String, trim: true, default: '' },
        completedAt: { type: Date },
    },
    { timestamps: true }
)

export default mongoose.model('EquipmentReturn', equipmentReturnSchema)
