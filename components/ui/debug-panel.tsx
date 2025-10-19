"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Database, 
  Server, 
  User,
  ChevronDown,
  ChevronUp,
  Copy,
  RefreshCw
} from "lucide-react"

interface DebugLog {
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  details?: any
}

interface DebugPanelProps {
  isOpen?: boolean
  onToggle?: () => void
}

export function DebugPanel({ isOpen: externalIsOpen, onToggle }: DebugPanelProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [dbStatus, setDbStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')
  const [sessionStatus, setSessionStatus] = useState<'unknown' | 'authenticated' | 'unauthenticated'>('unknown')
  const [apiHealth, setApiHealth] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown')
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen))

  const addLog = (type: DebugLog['type'], message: string, details?: any) => {
    const newLog: DebugLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      details
    }
    setLogs(prev => [newLog, ...prev].slice(0, 50)) // Keep last 50 logs
  }

  // Check database connection
  const checkDatabase = async () => {
    addLog('info', 'Checking database connection...')
    try {
      const response = await fetch('/api/test-connection')
      const data = await response.json()
      
      if (response.ok && data.connected) {
        setDbStatus('connected')
        addLog('success', 'Database connected successfully', data)
      } else {
        setDbStatus('disconnected')
        addLog('error', 'Database connection failed', data)
      }
    } catch (error) {
      setDbStatus('disconnected')
      addLog('error', 'Failed to check database connection', error)
    }
  }

  // Check session status
  const checkSession = async () => {
    addLog('info', 'Checking authentication session...')
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (data && data.user) {
        setSessionStatus('authenticated')
        addLog('success', `Authenticated as ${data.user.email}`, data.user)
      } else {
        setSessionStatus('unauthenticated')
        addLog('warning', 'No active session found')
      }
    } catch (error) {
      setSessionStatus('unauthenticated')
      addLog('error', 'Failed to check session', error)
    }
  }

  // Check API health
  const checkApiHealth = async () => {
    addLog('info', 'Checking API health...')
    try {
      const response = await fetch('/api/simple-test')
      const data = await response.json()
      
      if (response.ok) {
        setApiHealth('healthy')
        addLog('success', 'API is responding normally', data)
      } else {
        setApiHealth('unhealthy')
        addLog('error', 'API returned error status', data)
      }
    } catch (error) {
      setApiHealth('unhealthy')
      addLog('error', 'API is not responding', error)
    }
  }

  // Test event creation API
  const testEventCreation = async () => {
    addLog('info', '🧪 Testing event creation API...')
    
    const testEventData = {
      title: "DEBUG TEST EVENT",
      description: "This is a test event from debug panel",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      time: "14:00",
      cafe: "Debug Test Cafe",
      venue: "Debug Test Venue", // Send both
      university: "Vilnius University",
      contact: "debug@test.com",
      address: "123 Debug Street",
      maxAttendees: 10,
      tags: ["Debug", "Test"],
      isPublic: true
    }

    addLog('info', '📤 Sending request to /api/events', testEventData)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEventData),
      })

      const responseText = await response.text()
      addLog('info', `📥 Response status: ${response.status}`)
      addLog('info', `📥 Response headers: ${JSON.stringify([...response.headers.entries()])}`)
      
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = responseText
      }

      if (response.ok) {
        addLog('success', '✅ Event creation API test PASSED', responseData)
      } else {
        addLog('error', `❌ Event creation API test FAILED (${response.status})`, responseData)
      }
    } catch (error: any) {
      addLog('error', '❌ Event creation API test ERROR', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
  }

  // Run all checks
  const runAllChecks = async () => {
    addLog('info', '🔄 Running all diagnostic checks...')
    setLogs([]) // Clear previous logs
    await checkSession()
    await checkDatabase()
    await checkApiHealth()
    addLog('success', '✅ All diagnostic checks completed')
  }

  // Auto-run checks on mount
  useEffect(() => {
    if (isOpen) {
      runAllChecks()
    }
  }, [isOpen])

  const copyLogs = () => {
    const logsText = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}${log.details ? '\n' + JSON.stringify(log.details, null, 2) : ''}`
    ).join('\n\n')
    
    navigator.clipboard.writeText(logsText)
    addLog('success', 'Logs copied to clipboard')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
      case 'unauthenticated':
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getLogIcon = (type: DebugLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <>
      {/* Floating Debug Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={handleToggle}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
          title="Toggle Debug Panel"
        >
          <Bug className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-background border-l border-border shadow-2xl z-40 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  <h2 className="font-bold text-lg">Debug Panel</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggle}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>

              {/* Status Indicators */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(dbStatus)}
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium">Database</div>
                  <div className="text-xs opacity-80 capitalize">{dbStatus}</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(sessionStatus)}
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium">Session</div>
                  <div className="text-xs opacity-80 capitalize">{sessionStatus}</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(apiHealth)}
                    <Server className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium">API</div>
                  <div className="text-xs opacity-80 capitalize">{apiHealth}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-b border-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={runAllChecks} size="sm" variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={copyLogs} size="sm" variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Logs
                </Button>
              </div>
              <Button 
                onClick={testEventCreation} 
                size="sm" 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                🧪 Test Event Creation API
              </Button>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Activity Log</h3>
                <Badge variant="secondary">{logs.length} entries</Badge>
              </div>
              
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No logs yet. Run diagnostics to see activity.</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/50 rounded-lg p-3 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      {getLogIcon(log.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                          <Badge variant={log.type === 'error' ? 'destructive' : 'secondary'} className="text-xs">
                            {log.type}
                          </Badge>
                        </div>
                        <div className="font-medium break-words">{log.message}</div>
                        {log.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                              Show details
                            </summary>
                            <pre className="mt-2 text-xs bg-background p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
