import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'
import equipmentRoutes from './routes/equipmentRoutes.js'
import employeeRoutes from './routes/employeeRoutes.js'
import requestRoutes from './routes/requestRoutes.js'
import shipmentRoutes from './routes/shipmentRoutes.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/equipment', equipmentRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/shipments', shipmentRoutes)

app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong' })
})

export default app
