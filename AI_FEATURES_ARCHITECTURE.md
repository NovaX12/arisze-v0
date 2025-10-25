# AI Features - Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ARISZE AI HUB ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Main Nav   │  │  Dashboard   │  │  AI Hub Page │  │ Chat Window  │   │
│  │   + AI Hub   │  │  + AI Widget │  │  /ai-hub     │  │   (Modal)    │   │
│  │     Link     │  │              │  │              │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Quiz Lobby   │  │ Quiz Question│  │ Quiz Answer  │  │ Quiz Results │   │
│  │   Screen     │  │    Screen    │  │   Reveal     │  │    Screen    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  Technologies: React 18, TypeScript, Tailwind CSS, Shadcn/ui               │
│  State: React Context / Zustand                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS / WebSocket
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REAL-TIME COMMUNICATION LAYER                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           ┌─────────────────────┐                           │
│                           │   Socket.io Server   │                           │
│                           │   (WebSocket)        │                           │
│                           └─────────────────────┘                           │
│                                      │                                       │
│         ┌────────────────────────────┼────────────────────────────┐         │
│         │                            │                            │         │
│         ↓                            ↓                            ↓         │
│  ┌─────────────┐            ┌─────────────┐            ┌─────────────┐    │
│  │   Chat      │            │    Quiz     │            │ Presence    │    │
│  │  Messages   │            │  Game Sync  │            │  (Online)   │    │
│  │             │            │             │            │             │    │
│  │ • send      │            │ • match     │            │ • connect   │    │
│  │ • receive   │            │ • answer    │            │ • disconnect│    │
│  │ • typing    │            │ • reveal    │            │ • status    │    │
│  └─────────────┘            └─────────────┘            └─────────────┘    │
│                                                                              │
│  Technologies: Socket.io, Redis (optional for session storage)             │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Function Calls
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND API LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                      ┌────────────────────────────┐                         │
│                      │   Next.js 14 API Routes    │                         │
│                      └────────────────────────────┘                         │
│                                  │                                           │
│         ┌────────────────────────┼────────────────────────┐                │
│         │                        │                        │                │
│         ↓                        ↓                        ↓                │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐       │
│  │  Chat APIs  │          │  Quiz APIs  │          │  User APIs  │       │
│  ├─────────────┤          ├─────────────┤          ├─────────────┤       │
│  │ POST /send  │          │ POST /gen   │          │ GET /online │       │
│  │ GET /msgs   │          │ POST /answer│          │ GET /stats  │       │
│  │ POST /mod   │          │ GET /results│          │ POST /report│       │
│  └─────────────┘          └─────────────┘          └─────────────┘       │
│                                                                              │
│  Technologies: Next.js 14, NextAuth.js (session management)                │
└─────────────────────────────────────────────────────────────────────────────┘
         │                        │                        │
         │ MongoDB               │ Vertex AI              │ MongoDB
         │ Queries               │ API Calls              │ Queries
         ↓                        ↓                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────┐          ┌───────────────────────────────────┐  │
│  │   MongoDB Atlas       │          │   Google Cloud Vertex AI          │  │
│  ├───────────────────────┤          ├───────────────────────────────────┤  │
│  │ Collections:          │          │ Model: Gemini 1.5 Flash           │  │
│  │ • chatMessages        │          │ Purpose:                          │  │
│  │ • quizGames           │          │ 1. Generate quiz questions        │  │
│  │ • quizQuestions       │          │ 2. Moderate chat messages         │  │
│  │ • users (existing)    │          │ 3. Suggest quiz challenges        │  │
│  │                       │          │                                   │  │
│  │ Encryption: At rest   │          │ Context: 32K tokens               │  │
│  │ Retention: 30-90 days │          │ Latency: <3s (p95)                │  │
│  └───────────────────────┘          └───────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAMS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
FLOW 1: SENDING A CHAT MESSAGE
═══════════════════════════════════════════════════════════════════════════════

User A (Frontend)                                        User B (Frontend)
     │                                                        │
     │ 1. Type message: "Hey!"                               │
     │ 2. Click Send                                         │
     ├─────────────────► Socket.io Server ◄──────────────────┤
     │                          │                            │
     │                          │ 3. Validate session        │
     │                          │                            │
     │                          ├────► API: POST /chat/moderate
     │                          │      │
     │                          │      ├────► Vertex AI
     │                          │      │      "Is 'Hey!' safe?"
     │                          │      │      Response: {"safe": true}
     │                          │      │
     │                          │      ├────► MongoDB
     │                          │      │      Save message
     │                          │      │
     │                          │ ◄────┘
     │                          │
     │ 4. Emit to User B        │                            │
     ├────────────────────────────────────────────────────►  │
     │                          │                            │ 5. Receive "Hey!"
     │                          │                            │    Display in chat
     │                          │                            │
     │ 6. Show "Delivered ✓"   │                            │
     │                          │                            │


═══════════════════════════════════════════════════════════════════════════════
FLOW 2: STARTING A QUIZ GAME
═══════════════════════════════════════════════════════════════════════════════

User A                        Socket.io Server              Vertex AI
  │                                  │                          │
  │ 1. Click "Find Opponent"         │                          │
  ├─────────────────────────────────►│                          │
  │                                  │                          │
  │                                  │ 2. Add to matchmaking    │
  │                                  │    queue                 │
  │                                  │                          │
  │                                  │ 3. Match with User B     │
  │                                  │                          │
  │ 4. "Match found!"               │                          │
  │ ◄─────────────────────────────── │                          │
  │                                  │                          │
  │                                  │ 5. Generate questions    │
  │                                  ├─────────────────────────►│
  │                                  │  POST /quiz/generate     │
  │                                  │  {category: "General",   │
  │                                  │   difficulty: "medium",  │
  │                                  │   count: 10}             │
  │                                  │                          │
  │                                  │ ◄─────────────────────────┤
  │                                  │  Response: 10 questions  │
  │                                  │  (JSON array)            │
  │                                  │                          │
  │                                  │ 6. Save to MongoDB       │
  │                                  │                          │
  │ 7. Emit "quiz:start" to both    │                          │
  │ ◄─────────────────────────────── │                          │
  │                                  │                          │
  │ 8. Show lobby screen             │                          │
  │    "You vs. User B"              │                          │
  │    "3... 2... 1..."              │                          │
  │                                  │                          │
  │ 9. Start quiz!                   │                          │
  │                                  │                          │


═══════════════════════════════════════════════════════════════════════════════
FLOW 3: ANSWERING A QUIZ QUESTION
═══════════════════════════════════════════════════════════════════════════════

User A                        Socket.io Server              MongoDB
  │                                  │                          │
  │ Question 1/10 displayed          │                          │
  │ Timer: 20 seconds                │                          │
  │                                  │                          │
  │ 1. User selects "Option B"       │                          │
  │    at 8 seconds                  │                          │
  ├─────────────────────────────────►│                          │
  │  {questionId: 1,                 │                          │
  │   answer: "B",                   │                          │
  │   timeElapsed: 8}                │                          │
  │                                  │                          │
  │                                  │ 2. Validate answer       │
  │                                  ├─────────────────────────►│
  │                                  │  Check correct answer    │
  │                                  │  from quizQuestions      │
  │                                  │                          │
  │                                  │ ◄─────────────────────────┤
  │                                  │  Correct: true           │
  │                                  │                          │
  │                                  │ 3. Calculate score       │
  │                                  │    Base: +10 points      │
  │                                  │    Speed bonus: +5 pts   │
  │                                  │    Total: +15 pts        │
  │                                  │                          │
  │                                  │ 4. Update game state     │
  │                                  ├─────────────────────────►│
  │                                  │  UPDATE quizGames        │
  │                                  │  SET player1Score = 15   │
  │                                  │                          │
  │ 5. Emit "quiz:reveal" to both    │                          │
  │ ◄─────────────────────────────── │                          │
  │  {correct: "B",                  │                          │
  │   explanation: "...",            │                          │
  │   player1Score: 15,              │                          │
  │   player2Score: 10}              │                          │
  │                                  │                          │
  │ 6. Display correct answer        │                          │
  │    ✅ You: +15 pts                │                          │
  │    Wait 3 seconds...             │                          │
  │                                  │                          │
  │ 7. Next question                 │                          │
  │                                  │                          │


═══════════════════════════════════════════════════════════════════════════════
SECURITY & MODERATION FLOW
═══════════════════════════════════════════════════════════════════════════════

User sends: "Let's meet up!"

Frontend                    Backend API               Vertex AI
   │                            │                         │
   │ 1. Message input           │                         │
   ├───────────────────────────►│                         │
   │   POST /chat/moderate      │                         │
   │   {message: "Let's meet up!"}                        │
   │                            │                         │
   │                            │ 2. Send to Vertex AI    │
   │                            ├────────────────────────►│
   │                            │  Prompt:                │
   │                            │  "Analyze this message: │
   │                            │   'Let's meet up!'      │
   │                            │   Classify as SAFE or   │
   │                            │   UNSAFE"               │
   │                            │                         │
   │                            │ ◄────────────────────────┤
   │                            │  Response:              │
   │                            │  {"safe": true}         │
   │                            │                         │
   │                            │ 3. Save to MongoDB      │
   │                            │    (if safe)            │
   │                            │                         │
   │ 4. Response                │                         │
   │ ◄───────────────────────────┤                         │
   │   {success: true}          │                         │
   │                            │                         │
   │ 5. Socket.io emits message │                         │
   │    to recipient            │                         │
   │                            │                         │

═════════════════════════════════════════════════════════════════════════════


If user sends: "I hate you!" (unsafe)

   │                            │                         │
   │                            │ 2. Send to Vertex AI    │
   │                            ├────────────────────────►│
   │                            │                         │
   │                            │ ◄────────────────────────┤
   │                            │  Response:              │
   │                            │  {"safe": false,        │
   │                            │   "category": "hate"}   │
   │                            │                         │
   │                            │ 3. Block message        │
   │                            │    (NOT saved)          │
   │                            │                         │
   │ 4. Response                │                         │
   │ ◄───────────────────────────┤                         │
   │   {success: false,         │                         │
   │    error: "Message blocked"}                         │
   │                            │                         │
   │ 5. Show error in UI        │                         │
   │    "Message violated       │                         │
   │     community guidelines"  │                         │
   │                            │                         │


┌─────────────────────────────────────────────────────────────────────────────┐
│                        MONGODB SCHEMA DESIGN                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Collection: chatMessages
┌──────────────────────────────────────────────────────────────────────────┐
│ {                                                                        │
│   _id: ObjectId("507f1f77bcf86cd799439011"),                            │
│   senderId: ObjectId("68f955cc2490369bbd1e3aa8"),                       │
│   receiverId: ObjectId("68f97a138aa2c46dd4fa8328"),                     │
│   message: "Hey! Want to play a quiz?",                                 │
│   timestamp: ISODate("2025-10-23T10:30:00Z"),                           │
│   moderationFlag: false,                                                │
│   moderationCategory: null,                                             │
│   readStatus: false                                                     │
│ }                                                                        │
└──────────────────────────────────────────────────────────────────────────┘

Indexes:
- {senderId: 1, receiverId: 1, timestamp: -1}  ← Fetch chat history fast
- {timestamp: 1}  ← TTL index for auto-deletion after 30 days


Collection: quizGames
┌──────────────────────────────────────────────────────────────────────────┐
│ {                                                                        │
│   _id: ObjectId("507f1f77bcf86cd799439012"),                            │
│   player1Id: ObjectId("68f955cc2490369bbd1e3aa8"),                      │
│   player2Id: ObjectId("68f97a138aa2c46dd4fa8328"),                      │
│   questions: [                                                           │
│     {                                                                    │
│       questionId: 1,                                                     │
│       question: "What is 2+2?",                                          │
│       options: ["3", "4", "5", "6"],                                     │
│       correct: "4",                                                      │
│       category: "Math",                                                  │
│       difficulty: "easy"                                                 │
│     },                                                                   │
│     ... 9 more questions                                                │
│   ],                                                                     │
│   answers: {                                                             │
│     player1: [                                                           │
│       {questionId: 1, answer: "4", timeElapsed: 5, correct: true}       │
│     ],                                                                   │
│     player2: [                                                           │
│       {questionId: 1, answer: "3", timeElapsed: 8, correct: false}      │
│     ]                                                                    │
│   },                                                                     │
│   scores: {                                                              │
│     player1: 85,                                                         │
│     player2: 70                                                          │
│   },                                                                     │
│   winner: ObjectId("68f955cc2490369bbd1e3aa8"),                         │
│   status: "completed",  // "pending", "in-progress", "completed"        │
│   startTime: ISODate("2025-10-23T10:35:00Z"),                           │
│   endTime: ISODate("2025-10-23T10:40:00Z")                              │
│ }                                                                        │
└──────────────────────────────────────────────────────────────────────────┘

Indexes:
- {player1Id: 1, player2Id: 1}  ← Fetch user's games
- {status: 1, startTime: -1}  ← Show recent games


Collection: quizQuestions
┌──────────────────────────────────────────────────────────────────────────┐
│ {                                                                        │
│   _id: ObjectId("507f1f77bcf86cd799439013"),                            │
│   question: "What is the capital of Lithuania?",                        │
│   options: ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai"],               │
│   correct: "Vilnius",                                                    │
│   explanation: "Vilnius is the capital and largest city of Lithuania.", │
│   category: "Geography",                                                 │
│   difficulty: "easy",                                                    │
│   timesPlayed: 45,                                                       │
│   correctnessRate: 0.89,  // 89% of players answered correctly          │
│   language: "en",                                                        │
│   createdAt: ISODate("2025-10-20T08:00:00Z"),                           │
│   lastUsed: ISODate("2025-10-23T09:15:00Z")                             │
│ }                                                                        │
└──────────────────────────────────────────────────────────────────────────┘

Indexes:
- {category: 1, difficulty: 1}  ← Random question selection
- {lastUsed: 1}  ← Avoid recent questions
- {correctnessRate: 1}  ← Filter out bad questions


Collection: users (existing, extended)
┌──────────────────────────────────────────────────────────────────────────┐
│ {                                                                        │
│   _id: ObjectId("68f955cc2490369bbd1e3aa8"),                            │
│   name: "Alex Smith",                                                    │
│   email: "alex.smith@test.com",                                          │
│   university: "Vilnius University",                                      │
│   ...existing fields...                                                  │
│                                                                          │
│   // NEW FIELDS FOR AI HUB                                              │
│   aiHub: {                                                               │
│     chatsStarted: 5,                                                     │
│     quizzesPlayed: 12,                                                   │
│     quizWins: 7,                                                         │
│     quizLosses: 5,                                                       │
│     totalPoints: 950,                                                    │
│     favoriteCategories: ["Science", "Technology"],                       │
│     rank: 47,  // Global leaderboard rank                               │
│     lastActive: ISODate("2025-10-23T10:30:00Z"),                        │
│     onlineStatus: true                                                   │
│   }                                                                      │
│ }                                                                        │
└──────────────────────────────────────────────────────────────────────────┘

Indexes:
- {aiHub.onlineStatus: 1}  ← Get online users fast
- {aiHub.rank: 1}  ← Leaderboard queries


┌─────────────────────────────────────────────────────────────────────────────┐
│                        API ENDPOINTS REFERENCE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ CHAT ENDPOINTS                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ POST /api/ai-hub/chat/send-message                                      │
│ ├─ Body: {receiverId, message}                                          │
│ ├─ Action: Moderate via Vertex AI, save to DB, emit via Socket.io      │
│ └─ Response: {success: true, messageId}                                 │
│                                                                          │
│ GET /api/ai-hub/chat/get-messages?userId=xxx&limit=50                   │
│ ├─ Params: userId (other person), limit (default 50)                    │
│ ├─ Action: Fetch chat history from MongoDB                              │
│ └─ Response: [{senderId, message, timestamp}, ...]                      │
│                                                                          │
│ POST /api/ai-hub/chat/moderate                                          │
│ ├─ Body: {message}                                                      │
│ ├─ Action: Send to Vertex AI for safety check                          │
│ └─ Response: {safe: true/false, category: "hate/sexual/..."}            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ QUIZ ENDPOINTS                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ POST /api/ai-hub/quiz/generate-questions                                │
│ ├─ Body: {category, difficulty, count: 10}                              │
│ ├─ Action: Call Vertex AI Gemini 1.5 Flash, save to quizQuestions      │
│ └─ Response: [{question, options, correct, explanation}, ...] (10)      │
│                                                                          │
│ POST /api/ai-hub/quiz/submit-answer                                     │
│ ├─ Body: {gameId, questionId, answer, timeElapsed}                      │
│ ├─ Action: Validate answer, calculate score, update quizGames           │
│ └─ Response: {correct: true/false, points, explanation}                 │
│                                                                          │
│ GET /api/ai-hub/quiz/get-results?gameId=xxx                             │
│ ├─ Params: gameId                                                       │
│ ├─ Action: Fetch final game data from MongoDB                          │
│ └─ Response: {player1, player2, scores, winner, questions}              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ USER ENDPOINTS                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ GET /api/ai-hub/users/online                                            │
│ ├─ Action: Fetch users where aiHub.onlineStatus = true                  │
│ └─ Response: [{userId, name, university, avatar}, ...]                  │
│                                                                          │
│ GET /api/ai-hub/users/stats?userId=xxx                                  │
│ ├─ Params: userId (optional, defaults to current user)                  │
│ ├─ Action: Fetch aiHub stats from users collection                      │
│ └─ Response: {chatsStarted, quizzesPlayed, wins, rank, ...}             │
│                                                                          │
│ POST /api/ai-hub/users/report                                           │
│ ├─ Body: {reportedUserId, reason, details}                              │
│ ├─ Action: Save report to admin review queue                            │
│ └─ Response: {success: true}                                            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                        SOCKET.IO EVENT REFERENCE                             │
└─────────────────────────────────────────────────────────────────────────────┘

CLIENT → SERVER EVENTS
┌──────────────────────────────────────────────────────────────────────────┐
│ connect                                                                  │
│ ├─ Triggered: User opens AI Hub page                                    │
│ └─ Action: Server adds user to online list                              │
│                                                                          │
│ disconnect                                                               │
│ ├─ Triggered: User closes tab or loses connection                       │
│ └─ Action: Server removes user from online list                         │
│                                                                          │
│ chat:message                                                             │
│ ├─ Payload: {receiverId, message}                                       │
│ └─ Action: Validate, save to DB, emit to receiver                       │
│                                                                          │
│ chat:typing                                                              │
│ ├─ Payload: {receiverId}                                                │
│ └─ Action: Emit typing indicator to receiver                            │
│                                                                          │
│ quiz:find-match                                                          │
│ ├─ Payload: {}                                                          │
│ └─ Action: Add user to matchmaking queue                                │
│                                                                          │
│ quiz:answer                                                              │
│ ├─ Payload: {gameId, questionId, answer, timeElapsed}                   │
│ └─ Action: Validate answer, update scores, emit reveal                  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

SERVER → CLIENT EVENTS
┌──────────────────────────────────────────────────────────────────────────┐
│ user:online                                                              │
│ ├─ Payload: {userId, name, university}                                  │
│ └─ Action: Add user to online users list in UI                          │
│                                                                          │
│ user:offline                                                             │
│ ├─ Payload: {userId}                                                    │
│ └─ Action: Remove user from online users list                           │
│                                                                          │
│ chat:message                                                             │
│ ├─ Payload: {senderId, message, timestamp}                              │
│ └─ Action: Display message in chat window                               │
│                                                                          │
│ chat:typing                                                              │
│ ├─ Payload: {userId}                                                    │
│ └─ Action: Show "User is typing..." indicator                           │
│                                                                          │
│ quiz:match-found                                                         │
│ ├─ Payload: {gameId, opponent: {userId, name, university}}              │
│ └─ Action: Show lobby screen with opponent                              │
│                                                                          │
│ quiz:start                                                               │
│ ├─ Payload: {gameId, questions: [...]}                                  │
│ └─ Action: Start quiz, display first question                           │
│                                                                          │
│ quiz:reveal                                                              │
│ ├─ Payload: {correct, explanation, scores: {player1, player2}}          │
│ └─ Action: Show correct answer and updated scores                       │
│                                                                          │
│ quiz:next                                                                │
│ ├─ Payload: {questionIndex}                                             │
│ └─ Action: Load next question                                           │
│                                                                          │
│ quiz:end                                                                 │
│ ├─ Payload: {winner, scores, stats}                                     │
│ └─ Action: Show results screen                                          │
│                                                                          │
│ notification                                                             │
│ ├─ Payload: {type, message, action}                                     │
│ └─ Action: Show toast notification                                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```
