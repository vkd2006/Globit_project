import mongoose from 'mongoose'
import User from '../models/User.js'
import Employee from '../models/Employee.js'
import Equipment from '../models/Equipment.js'

export async function connectDB() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/globit'
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 })
        console.log('MongoDB connected to:', uri)
    } catch (err) {
        console.log(`Direct MongoDB connection failed (${err.message}). Starting in-memory MongoDB for local testing...`)
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server')
            const mongod = await MongoMemoryServer.create()
            const memUri = mongod.getUri()
            await mongoose.connect(memUri)
            console.log('In-memory MongoDB started and connected successfully!')
        } catch (memErr) {
            console.error('Failed to start in-memory MongoDB:', memErr.message)
            throw err
        }
    }

    // Auto-seed admin and sample employee if empty so testing works immediately!
    try {
        const adminCount = await User.countDocuments({ role: 'admin' })
        if (adminCount === 0) {
            await User.create({
                name: 'Administrator',
                email: 'admin@globit.com',
                password: 'Admin@12345',
                role: 'admin',
                active: true,
            })
            console.log('Default Admin created: admin@globit.com / Admin@12345')
        }

        const employeeUserCount = await User.countDocuments({ role: 'employee' })
        if (employeeUserCount === 0) {
            await User.create({
                name: 'Alex Rivera',
                email: 'alex@globit.com',
                password: 'Employee@123',
                role: 'employee',
                active: true,
            })
            let employee = await Employee.findOne({ email: 'alex@globit.com' })
            if (!employee) {
                employee = await Employee.create({
                    name: 'Alex Rivera',
                    email: 'alex@globit.com',
                    department: 'Engineering',
                    country: 'United States',
                    address: 'San Francisco, CA',
                    status: 'active',
                })
            }
            const sampleEq = await Equipment.findOne({ serialNumber: 'MBP-2026-001' })
            if (!sampleEq) {
                await Equipment.create({
                    name: 'MacBook Pro 14" M3',
                    type: 'laptop',
                    serialNumber: 'MBP-2026-001',
                    status: 'assigned',
                    country: 'United States',
                    assignedTo: employee._id,
                    notes: 'Standard engineering laptop',
                })
            }
            console.log('Default Employee created: alex@globit.com / Employee@123')
        }
    } catch (seedErr) {
        console.warn('Seed notice:', seedErr.message)
    }
}
