import { NextResponse } from "next/server"
import { firestoreDb, admin } from "@/lib/firebase"

export async function GET() {
  try {
    // Test Firestore connection by performing a simple query
    await firestoreDb.collection('health_check').limit(1).get()
    
    return NextResponse.json({
      status: "connected",
      database: "Firestore",
      projectId: admin.app().options.projectId,
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
