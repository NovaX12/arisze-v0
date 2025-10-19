/**
 * Error Suggestion System for ARISZE Debug Panel
 * Provides intelligent suggestions based on error messages and stack traces
 */

export interface ErrorSuggestion {
  category: string
  title: string
  description: string
  solution: string
  codeExample?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
}

export interface ErrorPattern {
  pattern: RegExp
  suggestions: ErrorSuggestion[]
}

// Common error patterns and their solutions
export const errorPatterns: ErrorPattern[] = [
  // React/Next.js Errors
  {
    pattern: /Cannot read propert(y|ies) of undefined/i,
    suggestions: [
      {
        category: 'React',
        title: 'Undefined Property Access',
        description: 'Attempting to access a property on an undefined object',
        solution: 'Use optional chaining (?.) or check if the object exists before accessing properties',
        codeExample: `// Instead of: user.name
// Use: user?.name or if (user) { user.name }`,
        priority: 'high',
        tags: ['javascript', 'react', 'undefined']
      }
    ]
  },
  {
    pattern: /Cannot read propert(y|ies) of null/i,
    suggestions: [
      {
        category: 'React',
        title: 'Null Property Access',
        description: 'Attempting to access a property on a null object',
        solution: 'Check for null values before accessing properties or use optional chaining',
        codeExample: `// Instead of: data.items
// Use: data?.items || []`,
        priority: 'high',
        tags: ['javascript', 'react', 'null']
      }
    ]
  },
  {
    pattern: /Hydration failed/i,
    suggestions: [
      {
        category: 'Next.js',
        title: 'Hydration Mismatch',
        description: 'Server-side rendered content differs from client-side content',
        solution: 'Ensure server and client render the same content, use useEffect for client-only code',
        codeExample: `// Use dynamic imports for client-only components
const ClientOnlyComponent = dynamic(() => import('./ClientComponent'), { ssr: false })`,
        priority: 'critical',
        tags: ['nextjs', 'ssr', 'hydration']
      }
    ]
  },
  {
    pattern: /useEffect has a missing dependency/i,
    suggestions: [
      {
        category: 'React',
        title: 'Missing useEffect Dependency',
        description: 'useEffect hook is missing dependencies in its dependency array',
        solution: 'Add all used variables to the dependency array or use useCallback/useMemo',
        codeExample: `// Add missing dependencies
useEffect(() => {
  fetchData(userId)
}, [userId]) // Include userId in dependencies`,
        priority: 'medium',
        tags: ['react', 'hooks', 'useEffect']
      }
    ]
  },
  
  // Database/API Errors
  {
    pattern: /fetch.*failed|Network request failed/i,
    suggestions: [
      {
        category: 'API',
        title: 'Network Request Failed',
        description: 'API request failed due to network issues or server problems',
        solution: 'Implement retry logic, check network connectivity, and handle errors gracefully',
        codeExample: `try {
  const response = await fetch('/api/data')
  if (!response.ok) throw new Error('Request failed')
  return await response.json()
} catch (error) {
  console.error('API Error:', error)
  // Handle error appropriately
}`,
        priority: 'high',
        tags: ['api', 'network', 'fetch']
      }
    ]
  },
  {
    pattern: /MongoDB.*connection|Database connection/i,
    suggestions: [
      {
        category: 'Database',
        title: 'Database Connection Issue',
        description: 'Unable to connect to MongoDB database',
        solution: 'Check connection string, network connectivity, and database server status',
        codeExample: `// Verify MONGODB_URI in .env.local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database`,
        priority: 'critical',
        tags: ['mongodb', 'database', 'connection']
      }
    ]
  },
  
  // Authentication Errors
  {
    pattern: /Unauthorized|401|Authentication failed/i,
    suggestions: [
      {
        category: 'Authentication',
        title: 'Authentication Error',
        description: 'User is not authenticated or session has expired',
        solution: 'Check authentication status, refresh tokens, or redirect to login',
        codeExample: `// Check authentication in API routes
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}`,
        priority: 'high',
        tags: ['auth', 'session', 'unauthorized']
      }
    ]
  },
  
  // TypeScript Errors
  {
    pattern: /Type.*is not assignable to type/i,
    suggestions: [
      {
        category: 'TypeScript',
        title: 'Type Assignment Error',
        description: 'Attempting to assign incompatible types',
        solution: 'Check type definitions, use type assertions, or update interface definitions',
        codeExample: `// Use proper typing
interface User {
  id: string
  name: string
}
const user: User = { id: '1', name: 'John' }`,
        priority: 'medium',
        tags: ['typescript', 'types', 'interface']
      }
    ]
  },
  
  // Component Errors
  {
    pattern: /Cannot resolve module|Module not found/i,
    suggestions: [
      {
        category: 'Import',
        title: 'Module Not Found',
        description: 'Unable to resolve import path or module',
        solution: 'Check file path, install missing dependencies, or update import statement',
        codeExample: `// Check import paths
import { Button } from '@/components/ui/button'
// Ensure the file exists and path is correct`,
        priority: 'high',
        tags: ['import', 'module', 'path']
      }
    ]
  },
  
  // Performance Issues
  {
    pattern: /Maximum update depth exceeded/i,
    suggestions: [
      {
        category: 'Performance',
        title: 'Infinite Re-render Loop',
        description: 'Component is stuck in an infinite re-render loop',
        solution: 'Check useEffect dependencies, avoid state updates in render, use useCallback/useMemo',
        codeExample: `// Avoid infinite loops
const memoizedCallback = useCallback(() => {
  // callback logic
}, [dependency])`,
        priority: 'critical',
        tags: ['react', 'performance', 'infinite-loop']
      }
    ]
  }
]

/**
 * Get suggestions for a given error message and stack trace
 */
export function getErrorSuggestions(message: string, stack?: string): ErrorSuggestion[] {
  const suggestions: ErrorSuggestion[] = []
  const searchText = `${message} ${stack || ''}`.toLowerCase()
  
  for (const pattern of errorPatterns) {
    if (pattern.pattern.test(searchText)) {
      suggestions.push(...pattern.suggestions)
    }
  }
  
  // If no specific suggestions found, provide general debugging tips
  if (suggestions.length === 0) {
    suggestions.push({
      category: 'General',
      title: 'General Debugging Tips',
      description: 'No specific solution found for this error',
      solution: 'Check console logs, verify data types, ensure all dependencies are installed, and review recent code changes',
      priority: 'low',
      tags: ['debugging', 'general']
    })
  }
  
  // Sort by priority
  return suggestions.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

/**
 * Extract file location from stack trace
 */
export function extractFileLocation(stack?: string): { file: string; line?: number; column?: number } | null {
  if (!stack) return null
  
  // Common stack trace patterns
  const patterns = [
    // Chrome/V8: at functionName (file:line:column)
    /at .* \((.+):(\d+):(\d+)\)/,
    // Firefox: functionName@file:line:column
    /@(.+):(\d+):(\d+)/,
    // General: file:line:column
    /(.+):(\d+):(\d+)/
  ]
  
  for (const pattern of patterns) {
    const match = stack.match(pattern)
    if (match) {
      const [, file, line, column] = match
      // Filter out node_modules and internal files
      if (!file.includes('node_modules') && !file.includes('webpack-internal')) {
        return {
          file: file.replace(process.cwd(), '').replace(/\\/g, '/'),
          line: parseInt(line, 10),
          column: parseInt(column, 10)
        }
      }
    }
  }
  
  return null
}

/**
 * Generate VS Code URL for opening file at specific location
 */
export function generateVSCodeUrl(file: string, line?: number, column?: number): string {
  const baseUrl = 'vscode://file'
  const fullPath = file.startsWith('/') ? file : `/${file}`
  let url = `${baseUrl}${fullPath}`
  
  if (line) {
    url += `:${line}`
    if (column) {
      url += `:${column}`
    }
  }
  
  return url
}

/**
 * Get error category based on message content
 */
export function categorizeError(message: string, stack?: string): string {
  const text = `${message} ${stack || ''}`.toLowerCase()
  
  if (text.includes('mongodb') || text.includes('database')) return 'Database'
  if (text.includes('auth') || text.includes('unauthorized')) return 'Authentication'
  if (text.includes('fetch') || text.includes('network') || text.includes('api')) return 'API'
  if (text.includes('hydration') || text.includes('ssr')) return 'Next.js'
  if (text.includes('type') || text.includes('typescript')) return 'TypeScript'
  if (text.includes('module') || text.includes('import')) return 'Import'
  if (text.includes('render') || text.includes('component')) return 'React'
  if (text.includes('performance') || text.includes('memory')) return 'Performance'
  
  return 'General'
}