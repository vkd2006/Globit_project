import mongoose from 'mongoose'
import User from '../models/User.js'

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

    // Auto-seed ONLY default admin if empty
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
    } catch (seedErr) {
        console.warn('Seed notice:', seedErr.message)
    }
}
