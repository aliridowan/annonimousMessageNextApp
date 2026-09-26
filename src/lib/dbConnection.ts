import mongoose from 'mongoose'

type ConnectionObject = {
  isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Database already connected")
    return
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to the .env file in the project root.")
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {})

    connection.isConnected = db.connections[0].readyState

    console.log("DB Connected Successfully")

  } catch (error) {
    console.log('DB connection failed', error)
    // Throw instead of process.exit so only this request fails, not the whole server
    throw error
  }
}

export default dbConnect
