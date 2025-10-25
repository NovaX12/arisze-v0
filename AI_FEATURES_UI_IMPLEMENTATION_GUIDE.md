# AI Features UI Implementation Guide

**Project:** Arisze AI Hub - Chat & Quiz Gaming  
**Date:** October 23, 2025  
**Reference PRD:** `AI_FEATURES_PRD.md`

---

## 📍 UI Integration Points

Based on your current Arisze UI structure, here's **exactly where** the AI features should be implemented:

---

## 1️⃣ **MAIN NAVIGATION BAR** (Add "AI Hub" Link)

### **Location:** Top navigation bar (between "Dashboard" and "Contact")

**Current Navigation:**
```
Home | Events & Activities | Dashboard | Contact
```

**New Navigation:**
```
Home | Events & Activities | AI Hub | Dashboard | Contact
```

### **Implementation:**
- **File:** `app/layout.tsx` or navigation component
- **Component:** Add new `<Link href="/ai-hub">AI Hub</Link>`
- **Icon:** 🤖 robot emoji or `<Sparkles>` icon from lucide-react
- **Badge:** Show red dot if user has unread messages or pending quiz challenges

### **Code Snippet:**
```tsx
<nav className="main-nav">
  <Link href="/">Home</Link>
  <Link href="/events">Events & Activities</Link>
  <Link href="/ai-hub" className="ai-hub-link">
    <Sparkles className="w-4 h-4" />
    AI Hub
    {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
  </Link>
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/contact">Contact</Link>
</nav>
```

---

## 2️⃣ **DASHBOARD - ADD AI HUB WIDGET**

### **Location:** Left sidebar "Navigation" section (after "My Events")

**Current Navigation Buttons:**
```
✓ Profile - Manage your personal details
✓ My Badges - View your achievements
✓ My Events - Track your bookings
```

**Add New Button:**
```
✓ Profile - Manage your personal details
✓ My Badges - View your achievements
✓ My Events - Track your bookings
+ AI Hub - Chat & Quiz Games  ← NEW!
```

### **Implementation:**
- **File:** `components/sections/dashboard-sidebar.tsx` (or similar)
- **Component:** Add new navigation button with icon
- **Icon:** `<MessageSquare>` for chat or `<Gamepad2>` for gaming
- **Live Stats:** Show "🟢 5 friends online" below button text

### **Code Snippet:**
```tsx
<button 
  onClick={() => router.push('/ai-hub')}
  className="dashboard-nav-button"
>
  <div className="icon-container">
    <Gamepad2 className="w-6 h-6" />
  </div>
  <div className="text-container">
    <div className="button-title">AI Hub</div>
    <div className="button-subtitle">Chat & Quiz Games</div>
    <div className="live-status">
      🟢 {onlineCount} friends online
    </div>
  </div>
</button>
```

---

## 3️⃣ **DASHBOARD - ADD AI STATS WIDGET**

### **Location:** Right side, below "Your Statistics" section

**Current Statistics:**
```
┌─────────────────────────────────────────┐
│        Your Statistics                  │
├─────────────────────────────────────────┤
│  0 Events Attended  │  0 Badges Earned  │
│  0 Connections      │  60% Profile      │
└─────────────────────────────────────────┘
```

**Add New Section:**
```
┌─────────────────────────────────────────┐
│        AI Hub Activity                  │  ← NEW!
├─────────────────────────────────────────┤
│  0 Chats Started    │  0 Quizzes Played │
│  0 Wins            │  0 Points Earned   │
│  [Open AI Hub Button]                   │
└─────────────────────────────────────────┘
```

### **Implementation:**
- **File:** `components/sections/dashboard-sidebar.tsx` or `app/dashboard/page.tsx`
- **Component:** New card component similar to "Your Statistics"
- **Data Source:** Fetch from `/api/ai-hub/user-stats`

### **Code Snippet:**
```tsx
<Card className="ai-hub-stats-widget">
  <CardHeader>
    <CardTitle>🤖 AI Hub Activity</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="stats-grid">
      <Stat label="Chats Started" value={userStats.chatsStarted} />
      <Stat label="Quizzes Played" value={userStats.quizzesPlayed} />
      <Stat label="Quiz Wins" value={userStats.wins} />
      <Stat label="Total Points" value={userStats.totalPoints} />
    </div>
    <Button 
      onClick={() => router.push('/ai-hub')}
      className="mt-4 w-full"
    >
      Open AI Hub
    </Button>
  </CardContent>
</Card>
```

---

## 4️⃣ **NEW PAGE: `/ai-hub` (Main AI Hub Landing)**

### **URL:** `http://localhost:3000/ai-hub`

### **Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Navigation Bar (with AI Hub highlighted)                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     AI Hub Header                            │
│   🤖 Welcome to AI Hub, Alex!                                │
│   Connect with students and compete in AI-powered quizzes    │
│                                                              │
│   🟢 12 students online now                                  │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬────────────────────────────────┐
│      💬 REAL-TIME CHAT      │      🎮 QUIZ BATTLE            │
├─────────────────────────────┼────────────────────────────────┤
│  Chat with students from    │  Compete in AI-generated       │
│  different universities     │  knowledge quizzes             │
│                             │                                │
│  [Start Chat] button        │  [Find Opponent] button        │
│                             │                                │
│  Online Users:              │  Recent Games:                 │
│  • Tomas (KTU) 🟢           │  • You vs. Elena: 85-70 ✅     │
│  • Maria (VU) 🟢            │  • You vs. Jonas: 60-90 ❌     │
│  • Elena (LSMU) 🟢          │                                │
└─────────────────────────────┴────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Your AI Hub Stats                               │
│   Chats: 5  |  Quizzes: 12  |  Win Rate: 58%  |  Rank: #47  │
└──────────────────────────────────────────────────────────────┘
```

### **Implementation:**
- **File:** `app/ai-hub/page.tsx` (create new)
- **Components:** 
  - `components/sections/ai-hub-header.tsx`
  - `components/sections/chat-section.tsx`
  - `components/sections/quiz-battle-section.tsx`

### **Code Structure:**
```tsx
// app/ai-hub/page.tsx
export default function AIHubPage() {
  return (
    <div className="ai-hub-page">
      <AIHubHeader onlineCount={onlineUsers.length} />
      
      <div className="ai-hub-grid">
        <ChatSection users={onlineUsers} />
        <QuizBattleSection recentGames={userGames} />
      </div>
      
      <AIHubStats stats={userStats} />
    </div>
  )
}
```

---

## 5️⃣ **CHAT MODAL/PANEL** (Overlay or Side Panel)

### **Trigger:** Click "Start Chat" or click on a user from online list

### **Layout Option A - Modal (Centered):**

```
┌─────────────────────────────────────────┐
│  💬 Chat with Tomas (KTU)          [X]  │
├─────────────────────────────────────────┤
│                                         │
│  Tomas: Hey! How's the algorithms       │
│         course at VU?                   │
│         [10:23 AM]                      │
│                                         │
│         You: Pretty challenging but     │
│            fun! Want to test your       │
│            knowledge? 😄                │
│            [10:25 AM]                   │
│                                         │
│  🤖 AI suggests: Challenge Tomas to     │
│     an Algorithms Quiz!                 │
│     [Challenge] [Dismiss]               │
│                                         │
├─────────────────────────────────────────┤
│  [Type a message...]          [Send]    │
└─────────────────────────────────────────┘
```

### **Layout Option B - Side Panel (Right Side):**

```
Main Content            │  💬 Chat Panel
(AI Hub Page)           │  ┌─────────────────────┐
                        │  │ Tomas (KTU)    [X]  │
                        │  ├─────────────────────┤
                        │  │ Messages...         │
                        │  │                     │
                        │  │                     │
                        │  ├─────────────────────┤
                        │  │ [Type...]   [Send]  │
                        │  └─────────────────────┘
```

### **Implementation:**
- **File:** `components/ui/chat-window.tsx`
- **Library:** Socket.io for real-time messaging
- **State Management:** React Context or Zustand for global chat state

### **Key Features:**
- Real-time message delivery (<500ms)
- Typing indicator ("Tomas is typing...")
- Message timestamps
- AI suggestion cards (after 5+ messages)
- Scroll to bottom on new message
- Emoji picker 🎉

---

## 6️⃣ **QUIZ GAME SCREEN** (Full-Screen Overlay)

### **Trigger:** Accept quiz challenge or click "Find Opponent"

### **Layout - Lobby Screen:**

```
┌──────────────────────────────────────────────────────────────┐
│                     QUIZ BATTLE LOBBY                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│         👤 Alex (VU)          VS          👤 Tomas (KTU)     │
│         Ready ✅                           Ready ✅           │
│                                                              │
│                    Starting in 3...                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### **Layout - Question Screen:**

```
┌──────────────────────────────────────────────────────────────┐
│  Question 3/10                        ⏱️ 15 seconds left     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  What is the time complexity of binary search?              │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │  A) O(n)       │  │  B) O(log n)   │  ← Click option    │
│  └────────────────┘  └────────────────┘                    │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │  C) O(n²)      │  │  D) O(1)       │                    │
│  └────────────────┘  └────────────────┘                    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  👤 You: 25 pts       👤 Tomas: 30 pts                       │
└──────────────────────────────────────────────────────────────┘
```

### **Layout - Answer Reveal:**

```
┌──────────────────────────────────────────────────────────────┐
│  Question 3/10 - Correct Answer                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  What is the time complexity of binary search?              │
│                                                              │
│  ┌────────────────┐  ┌──────────────────┐                  │
│  │  A) O(n)       │  │  ✅ B) O(log n)  │  ← Correct!      │
│  └────────────────┘  └──────────────────┘                  │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │  C) O(n²)      │  │  D) O(1)       │                    │
│  └────────────────┘  └────────────────┘                    │
│                                                              │
│  💡 Binary search divides the search space in half each     │
│     iteration, resulting in O(log n) time complexity.       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  👤 You: 35 pts (+10) ✅  👤 Tomas: 45 pts (+15) ⚡         │
│                                                              │
│  Next question in 3 seconds...                              │
└──────────────────────────────────────────────────────────────┘
```

### **Layout - Results Screen:**

```
┌──────────────────────────────────────────────────────────────┐
│                     🎉 TOMAS WINS! 🎉                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│         👤 Alex (VU)               👤 Tomas (KTU)            │
│         Score: 85                  Score: 90 🏆             │
│         Accuracy: 8/10             Accuracy: 9/10            │
│         Avg Time: 8s               Avg Time: 6s              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  [Play Again]  [Challenge to Rematch]  [Start Chat]         │
│                    [Return to AI Hub]                        │
└──────────────────────────────────────────────────────────────┘
```

### **Implementation:**
- **File:** `components/sections/quiz-game-screen.tsx`
- **States:** `lobby` → `question` → `answer` → `results`
- **Socket Events:** 
  - `quiz:start` (both players ready)
  - `quiz:answer` (player submits answer)
  - `quiz:reveal` (show correct answer)
  - `quiz:next` (load next question)
  - `quiz:end` (show results)

---

## 7️⃣ **NOTIFICATION TOASTS**

### **Location:** Bottom-right corner (or top-right)

### **Types of Notifications:**

**1. New Message:**
```
┌─────────────────────────────────┐
│  💬 New message from Tomas      │
│  "Hey! Want to play a quiz?"    │
│  [View] [Dismiss]               │
└─────────────────────────────────┘
```

**2. Quiz Challenge:**
```
┌─────────────────────────────────┐
│  🎮 Tomas challenged you!       │
│  Knowledge Quiz - 10 questions  │
│  [Accept] [Decline]             │
└─────────────────────────────────┘
```

**3. Match Found:**
```
┌─────────────────────────────────┐
│  ✅ Match found!                │
│  You vs. Elena (LSMU)           │
│  Starting quiz...               │
└─────────────────────────────────┘
```

### **Implementation:**
- **File:** Use existing toast system from `components/ui/toast.tsx`
- **Library:** Sonner or React Hot Toast
- **Socket Integration:** Listen to `notification` events

---

## 📂 File Structure for AI Features

```
arisze-app/
├── app/
│   ├── ai-hub/
│   │   ├── page.tsx                    ← Main AI Hub page
│   │   └── layout.tsx                  ← Layout wrapper
│   └── api/
│       └── ai-hub/
│           ├── chat/
│           │   ├── send-message/
│           │   │   └── route.ts        ← Send chat message API
│           │   ├── get-messages/
│           │   │   └── route.ts        ← Fetch chat history
│           │   └── moderate/
│           │       └── route.ts        ← AI moderation API
│           ├── quiz/
│           │   ├── generate-questions/
│           │   │   └── route.ts        ← Vertex AI question generation
│           │   ├── submit-answer/
│           │   │   └── route.ts        ← Submit quiz answer
│           │   └── get-results/
│           │       └── route.ts        ← Get quiz results
│           └── users/
│               ├── online/
│               │   └── route.ts        ← Get online users list
│               └── stats/
│                   └── route.ts        ← Get user AI Hub stats
│
├── components/
│   ├── sections/
│   │   ├── ai-hub-header.tsx           ← Header for AI Hub page
│   │   ├── chat-section.tsx            ← Chat UI (user list + messages)
│   │   ├── quiz-battle-section.tsx     ← Quiz UI (matchmaking + game)
│   │   ├── ai-hub-stats.tsx            ← Stats widget
│   │   └── dashboard-ai-widget.tsx     ← Dashboard integration
│   │
│   └── ui/
│       ├── chat-window.tsx             ← Chat modal/panel component
│       ├── quiz-game-screen.tsx        ← Full-screen quiz game
│       ├── quiz-lobby.tsx              ← Pre-game lobby
│       ├── quiz-question.tsx           ← Question display component
│       ├── quiz-results.tsx            ← Results screen
│       └── online-users-list.tsx       ← List of online users
│
├── lib/
│   ├── socket.ts                       ← Socket.io client setup
│   ├── vertex-ai.ts                    ← Vertex AI integration
│   └── ai-hub-utils.ts                 ← Helper functions
│
└── types/
    └── ai-hub.d.ts                     ← TypeScript types
```

---

## 🎨 Design Tokens & Colors

### **AI Hub Brand Colors:**

```css
/* AI Hub specific colors */
--ai-hub-primary: #8b5cf6;      /* Purple for AI theme */
--ai-hub-secondary: #ec4899;    /* Pink accent */
--ai-hub-success: #10b981;      /* Green for correct answers */
--ai-hub-error: #ef4444;        /* Red for wrong answers */
--ai-hub-warning: #f59e0b;      /* Orange for timer */

/* Status colors */
--online-status: #10b981;       /* Green dot for online users */
--offline-status: #6b7280;      /* Gray dot for offline users */
```

### **Icons:**

- **AI Hub:** `<Sparkles>` or `<Brain>` from lucide-react
- **Chat:** `<MessageSquare>` or `<MessagesSquare>`
- **Quiz:** `<Gamepad2>` or `<Trophy>`
- **Online Status:** `<Circle fill="green">` (small dot)

---

## 🔌 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-hub/users/online` | GET | Get list of online users |
| `/api/ai-hub/chat/send-message` | POST | Send chat message |
| `/api/ai-hub/chat/get-messages` | GET | Fetch chat history |
| `/api/ai-hub/chat/moderate` | POST | Moderate message via Vertex AI |
| `/api/ai-hub/quiz/generate-questions` | POST | Generate 10 quiz questions |
| `/api/ai-hub/quiz/submit-answer` | POST | Submit user answer |
| `/api/ai-hub/quiz/get-results` | GET | Get final quiz results |
| `/api/ai-hub/users/stats` | GET | Get user AI Hub stats |

---

## 🚀 Implementation Priority

### **Phase 1: Core Infrastructure (Week 1-2)**
1. Set up Socket.io server (real-time engine)
2. Create MongoDB collections (`chatMessages`, `quizGames`, `quizQuestions`)
3. Integrate Vertex AI API (test question generation)
4. Build `/ai-hub` page structure (empty layout)

### **Phase 2: Chat Feature (Week 3-4)**
5. Build online users list
6. Implement chat window UI
7. Add real-time messaging (Socket.io)
8. Integrate AI moderation
9. Add chat notifications

### **Phase 3: Quiz Feature (Week 5-6)**
10. Build quiz matchmaking system
11. Implement quiz lobby UI
12. Build question display + timer
13. Add answer submission + scoring
14. Build results screen

### **Phase 4: Integration & Polish (Week 7-8)**
15. Add dashboard widgets
16. Integrate navigation links
17. Add notification system
18. Performance testing
19. Bug fixes
20. Beta testing with 20 students

---

## 📸 Screenshots to Create

Before development, create mockups for:

1. `ai-hub-landing.png` - Main AI Hub page
2. `chat-user-list.png` - Online users list
3. `chat-window.png` - Chat interface
4. `chat-ai-suggestion.png` - AI quiz suggestion card
5. `quiz-matchmaking.png` - Finding opponent screen
6. `quiz-lobby.png` - Pre-game lobby
7. `quiz-question-screen.png` - Question display
8. `quiz-answer-reveal.png` - Correct answer shown
9. `quiz-results.png` - Final scores
10. `dashboard-ai-widget.png` - Dashboard integration

---

## ✅ Next Steps

1. **Review this guide** and confirm UI placement
2. **Create Figma mockups** based on these layouts
3. **Set up Google Cloud Project** with Vertex AI
4. **Start with Phase 1** (infrastructure setup)
5. **Weekly demos** to showcase progress

---

**Questions?** Refer to `AI_FEATURES_PRD.md` for detailed requirements and technical specifications.

**Screenshot saved:** `dashboard-ai-integration-mockup.png` shows current dashboard state.
