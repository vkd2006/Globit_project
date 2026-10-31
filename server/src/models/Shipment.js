import mongoose from 'mongoose'

const timelineSchema = new mongoose.Schema(
    {
        status: { type: String, required: true },
        note: { type: String, trim: true, default: '' },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
)

const shipmentSchema = new mongoose.Schema(
    {
        equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
        carrier: { type: String, trim: true },
        trackingNumber: { type: String, trim: true },
        destinationCountry: { type: String, trim: true },
        status: {
            type: String,
            enum: ['processing', 'in_transit', 'delivered', 'cancelled'],
            default: 'processing',
        },
        timeline: [timelineSchema],
    },
    { timestamps: true }
)

export default mongoose.model('Shipment', shipmentSchema)