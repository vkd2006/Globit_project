import { connectDB } from './config/db.js'
import mongoose from 'mongoose'
import User from './models/User.js'

await connectDB()
await User.deleteOne({ email: 'admin@globit.com' })
await User.create({
    name: 'Administrator',
    email: 'admin@globit.com',
    password: 'Admin@12345',
    role: 'admin',
})
console.log('Admin created: admin@globit.com / Admin@12345')
await mongoose.disconnect()