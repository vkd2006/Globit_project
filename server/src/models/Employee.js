import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        department: { type: String, trim: true, default: '' },
        country: { type: String, trim: true, default: '' },
        address: { type: String, trim: true, default: '' },
        status: {
            type: String,
            enum: ['active', 'inactive', 'on_leave'],
            default: 'active',
        },
    },
    { timestamps: true }
)

export default mongoose.model('Employee', employeeSchema)
