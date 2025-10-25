import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    await db.command({ ping: 1 })
    
    return NextResponse.json({
      status: "connected",
      database: db.databaseName,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error("Database health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
