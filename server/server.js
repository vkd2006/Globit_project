import 'dotenv/config'
import app from './src/app.js'
import { connectDB } from './src/config/db.js'

const port = process.env.PORT || 5000

connectDB()
    .then(() => app.listen(port, () => console.log('Server running on port ${port}')))
    .catch((err) => {
        console.error('Failed to start server:', err.message)
        process.exit(1)
    })