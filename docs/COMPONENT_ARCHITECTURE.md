# ARISZE Component Architecture Documentation

## Overview
The ARISZE application follows a modular component architecture built with React, TypeScript, and Next.js 14. Components are organized into logical categories for maintainability and reusability.

## Directory Structure

```
components/
├── providers.tsx           # Context providers (Theme, Auth)
├── theme-provider.tsx      # Theme context provider
├── sections/              # Page-specific sections
│   ├── badges-section.tsx
│   ├── community-feed.tsx
│   ├── contact-form.tsx
│   ├── create-post.tsx
│   ├── dashboard-sidebar.tsx
│   ├── events-filters.tsx
│   ├── events-grid.tsx
│   ├── events-view.tsx
│   ├── featured-events-section.tsx
│   ├── hero-section.tsx
│   ├── my-events-section.tsx
│   ├── profile-section.tsx
│   ├── recommendations-grid.tsx
│   ├── universities-view.tsx
│   └── vibe-quiz.tsx
└── ui/                    # Reusable UI components
    ├── [shadcn/ui components]
    └── [custom components]
```

## Component Categories

### 1. Provider Components
- **providers.tsx**: Main providers wrapper
- **theme-provider.tsx**: Theme context and dark/light mode

### 2. Section Components (Page-Level)
Large, feature-specific components that compose entire page sections:

#### Core Sections
- **hero-section.tsx**: Landing page hero with animations
- **dashboard-sidebar.tsx**: Main navigation sidebar
- **profile-section.tsx**: User profile management

#### Event Management
- **events-view.tsx**: Main events display container
- **events-grid.tsx**: Grid layout for events
- **events-filters.tsx**: Event filtering controls
- **featured-events-section.tsx**: Highlighted events
- **my-events-section.tsx**: User's personal events

#### Community Features
- **community-feed.tsx**: Social feed display
- **create-post.tsx**: Post creation interface
- **recommendations-grid.tsx**: Event recommendations

#### Specialized Sections
- **badges-section.tsx**: Achievement system display
- **contact-form.tsx**: Contact/support form
- **universities-view.tsx**: University selection/display
- **vibe-quiz.tsx**: Personality quiz component

### 3. UI Components

#### Base UI (shadcn/ui)
Standard UI primitives with consistent styling:
- **button.tsx**: Primary button component
- **card.tsx**: Container component
- **dialog.tsx**: Modal dialogs
- **input.tsx**: Form inputs
- **badge.tsx**: Status/tag badges
- **table.tsx**: Data tables
- **form.tsx**: Form wrapper
- **select.tsx**: Dropdown selections
- **checkbox.tsx**: Checkbox inputs
- **tabs.tsx**: Tab navigation
- **toast.tsx**: Notification system

#### Custom UI Components
Application-specific components:

##### Event System
- **event-card.tsx**: Individual event display
- **event-skeleton-card.tsx**: Loading placeholder
- **booking-modal.tsx**: Event booking interface
- **create-event-modal.tsx**: Event creation form
- **participant-details-modal.tsx**: Participant management

##### University System
- **university-card.tsx**: University display card
- **cafe-card.tsx**: Cafe location display

##### Recommendation System
- **recommendation-card.tsx**: Personalized recommendations

##### Navigation & Layout
- **header.tsx**: Main navigation header
- **footer.tsx**: Site footer
- **sidebar.tsx**: Collapsible sidebar
- **navigation-menu.tsx**: Main navigation

##### Visual Effects
- **particle-background.tsx**: Animated background
- **blob-animation.tsx**: Morphing blob effects
- **crown-3d.tsx**: 3D crown animation

##### Utility Components
- **features-modal.tsx**: Feature showcase
- **use-mobile.tsx**: Mobile detection hook
- **use-toast.ts**: Toast notification hook

## Component Patterns

### 1. Event Card Pattern
```typescript
interface Event {
  id: number
  title: string
  cafe: string
  image: string
  date: string
  tags: string[]
  attendees: number
  maxAttendees: number
  university?: string
  description?: string
  contact?: string
  address?: string
}

interface EventCardProps {
  event: Event
  featured?: boolean
  onBookClick?: () => void
}
```

### 2. Modal Pattern
All modals follow consistent structure:
- Dialog wrapper from shadcn/ui
- AnimatePresence for smooth transitions
- Consistent close handlers
- Form validation with react-hook-form

### 3. Animation Pattern
Using Framer Motion for consistent animations:
```typescript
<motion.div
  whileHover={{ y: -6, scale: 1.02 }}
  transition={{ duration: 0.3 }}
>
```

## State Management

### 1. Client State
- React hooks (useState, useEffect)
- Custom hooks for reusable logic
- Context providers for global state

### 2. Server State
- NextAuth.js for authentication
- API routes for data fetching
- SWR/React Query patterns (where applicable)

### 3. Form State
- react-hook-form for complex forms
- Zod for validation schemas
- Consistent error handling

## Styling Architecture

### 1. Tailwind CSS
- Utility-first approach
- Custom design system via tailwind.config.js
- Consistent spacing and color scales

### 2. CSS Variables
- Theme-aware color system
- Dark/light mode support
- Custom properties for animations

### 3. Component Variants
- shadcn/ui variant system
- Consistent component APIs
- Type-safe styling props

## Performance Considerations

### 1. Code Splitting
- Dynamic imports for heavy components
- Route-based splitting via Next.js
- Lazy loading for modals and overlays

### 2. Image Optimization
- Next.js Image component
- Proper aspect ratios
- Lazy loading by default

### 3. Animation Performance
- Hardware acceleration via CSS transforms
- Framer Motion optimization
- Reduced motion preferences

## Testing Strategy

### 1. Component Testing
- Jest + React Testing Library
- Isolated component tests
- Mock external dependencies

### 2. Integration Testing
- User interaction flows
- Form submission testing
- API integration tests

### 3. Visual Testing
- Storybook for component documentation
- Visual regression testing
- Accessibility testing

## Development Guidelines

### 1. Component Creation
1. Start with TypeScript interfaces
2. Implement base functionality
3. Add animations and interactions
4. Write tests and documentation

### 2. Naming Conventions
- PascalCase for components
- kebab-case for files
- Descriptive, feature-based names

### 3. File Organization
- One component per file
- Co-locate related utilities
- Separate concerns clearly

### 4. Props Design
- Prefer composition over configuration
- Use discriminated unions for variants
- Provide sensible defaults

## Common Patterns

### 1. Loading States
```typescript
const [isLoading, setIsLoading] = useState(false)
// Consistent loading UI across components
```

### 2. Error Handling
```typescript
const [error, setError] = useState<string | null>(null)
// Standardized error display
```

### 3. Data Fetching
```typescript
useEffect(() => {
  // Fetch data with proper cleanup
}, [dependencies])
```

## Future Improvements

### 1. Component Library
- Extract reusable components
- Create design system package
- Improve documentation

### 2. Performance
- Implement virtual scrolling
- Optimize bundle size
- Add service worker caching

### 3. Accessibility
- Improve ARIA labels
- Keyboard navigation
- Screen reader support

### 4. Testing
- Increase test coverage
- Add E2E tests
- Performance testing

## Maintenance Notes

### 1. Dependencies
- Regular updates for security
- Monitor bundle size impact
- Test breaking changes thoroughly

### 2. Code Quality
- ESLint and Prettier configuration
- TypeScript strict mode
- Regular code reviews

### 3. Documentation
- Keep component docs updated
- Document breaking changes
- Maintain migration guides

---

*Last Updated: December 2024*
*Total Components: 70+*
*Architecture: React + TypeScript + Next.js 14*