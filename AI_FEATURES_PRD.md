# AI-POWERED CHAT & COMPETITIVE QUIZ SYSTEM PRD

**Product:** Arisze AI Hub - Real-time Chat & Quiz Gaming  
**Version:** 1.0  
**Date:** October 23, 2025  
**Status:** Ready for Development  
**Tech Stack:** Next.js 14, MongoDB, Vertex AI Studio, Socket.io

---

# CONTENTS

1. [Abstract](#-abstract)
2. [Business Objectives](#-business-objectives)
3. [KPI](#-kpi)
4. [Success Criteria](#-success-criteria)
5. [User Journeys](#️-user-journeys)
6. [Scenarios](#-scenarios)
7. [User Flow](#️-user-flow)
8. [Functional Requirements](#-functional-requirements)
9. [Model Requirements](#-model-requirements)
10. [Data Requirements](#-data-requirements)
11. [Prompt Requirements](#-prompt-requirements)
12. [Testing & Measurement](#-testing--measurement)
13. [Risks & Mitigations](#️-risks--mitigations)
14. [Costs](#-costs)
15. [Assumptions & Dependencies](#-assumptions--dependencies)
16. [Compliance/Privacy/Legal](#-complianceprivacylegal)
17. [GTM/Rollout Plan](#-gtmrollout-plan)

---

## 📝 Abstract

Arisze AI Hub introduces two interconnected features to increase student engagement across universities in Lithuania:

1. **Real-time Chat System:** Enables 1-on-1 messaging between students from different universities with AI moderation and assistance
2. **AI Competitive Quiz Games:** Real-time multiplayer knowledge/leisure quiz games generated dynamically by Vertex AI, delivered in gaming format with scoring, timers, and winner announcements

**Purpose:** Transform Arisze from an event-booking platform into a comprehensive social ecosystem where students connect through both real-life events and virtual interactions.

**Rationale:** Current platform has events and profiles but lacks real-time interaction. Adding AI-powered chat and gamified learning creates stickiness, increases daily active users, and differentiates Arisze from competitors.

---

## 🎯 Business Objectives

- **Increase Platform Stickiness:** Daily active users return for chat and quiz games, not just event booking
- **Cross-University Connections:** Break down university silos by enabling students from VU, KTU, VMU, etc. to interact
- **AI Differentiation:** Position Arisze as an innovative AI-powered student platform
- **Revenue Pathway:** Future premium features (quiz tournaments, AI tutoring) create monetization opportunities
- **Data Collection:** Chat and quiz interactions provide behavioral data to improve recommendations and event matching
- **Retention Boost:** Students engaged in AI features are 3x more likely to attend events (hypothesis to validate)

---

## 📊 KPI

| GOAL                          | METRIC                  | TARGET (8 weeks)   | QUESTION                                                    |
| ----------------------------- | ----------------------- | ------------------ | ----------------------------------------------------------- |
| AI Chat Adoption              | # Active Chat Users     | 50+ students       | How many students initiate at least one chat conversation?  |
| Quiz Game Engagement          | # Quiz Games Played     | 200+ games         | How many quiz sessions are completed?                       |
| Feature Retention             | D7 Retention Rate       | 40%                | Do users who try AI features return within 7 days?          |
| Cross-University Connections  | % Chats Across Unis     | 60%                | Are students connecting beyond their own university?        |
| AI Quiz Completion Rate       | % Games Finished        | 75%                | Do players complete games or drop mid-quiz?                 |

---

## 🏆 Success Criteria

**Launch Success (Week 1-2):**
- AI Hub page live and accessible from main navigation
- Zero critical bugs in chat delivery or quiz generation
- 10+ beta testers complete full user journey (chat → quiz → results)

**Early Traction (Week 3-8):**
- 50+ students use chat feature at least once
- 200+ quiz games played (avg 25 games/week)
- 40% of users return within 7 days
- Positive feedback from 80%+ of surveyed users

**Technical Success:**
- Chat latency <500ms (p95)
- Quiz question generation <3 seconds
- 99% uptime for real-time features
- Zero data breach or privacy incidents

**Qualitative Success:**
- Students describe experience as "fun," "engaging," "competitive"
- University administration approves for wider rollout
- Media coverage from at least one Lithuanian tech/education outlet

---

## 🚶‍♀️ User Journeys

### **Journey 1: First-Time Chat User**
Maria (VU, Year 2, CS) wants to connect with students from other universities about study tips.

1. Logs into Arisze → Sees "AI Hub" in navigation (new!)
2. Clicks AI Hub → Lands on hub page with two cards: "Chat" and "Quiz Battle"
3. Clicks "Start Chat" → Sees list of online students from different universities
4. Selects Tomas (KTU, Year 3, CS) → Chat window opens
5. Sends message: "Hey! How's the algorithms course at KTU?"
6. Tomas responds in real-time
7. AI suggests: "Want to test your algorithms knowledge? Challenge Tomas to a quiz!"
8. Maria clicks "Challenge" → Both enter quiz lobby

### **Journey 2: Competitive Quiz Player**
Lukas (VMU) loves gaming and wants to test his general knowledge against peers.

1. Opens Arisze → Clicks "AI Hub" from dashboard widget
2. Selects "Quiz Battle" → Sees "Find Opponent" button
3. Clicks button → Matched with random student (Elena from LSMU)
4. Lobby shows both players' avatars and "Ready?" countdown
5. Quiz starts: 10 multiple-choice questions, 20 seconds each
6. AI generates questions across categories: History, Science, Pop Culture, Sports
7. After each question, both see correct answer and current scores
8. Game ends → Winner screen with final scores and "Play Again?" option
9. Option to "Challenge to Rematch" or "Return to Chat"

### **Journey 3: Casual Browser**
Jonas (KTU) isn't looking for anything specific but is curious about AI features.

1. Sees dashboard widget: "🎮 Try AI Quiz - 2 friends online now!"
2. Clicks → Taken to AI Hub
3. Explores chat list → Sees 5 students online
4. Doesn't initiate chat but clicks "Random Quiz Match"
5. Matched immediately → Plays quick 5-question quiz
6. Loses but enjoys experience → Bookmarks AI Hub for later

---

## 📖 Scenarios

### **Primary Scenarios (Must Support)**
1. **1-on-1 Real-Time Chat:** Student A sends message to Student B, delivery <500ms
2. **AI Quiz Challenge:** Two students compete in 10-question quiz, AI generates unique questions
3. **Quiz Matchmaking:** Student clicks "Find Opponent" → Matched with online peer within 10 seconds
4. **Chat History Persistence:** Student returns next day, sees previous conversations
5. **AI Moderation:** Inappropriate chat message flagged and blocked automatically

### **Secondary Scenarios (Nice to Have - Future)**
6. Group chat (3+ students)
7. Quiz tournaments (bracket-style, 8+ players)
8. Leaderboards (top quiz players this week/month)
9. AI tutor mode (study help in chat)
10. Quiz category selection (only science questions, only pop culture, etc.)

### **Edge Cases to Handle**
- Opponent disconnects mid-quiz → Award remaining points to active player
- Chat partner goes offline → Show "offline" status, messages delivered when they return
- AI generates duplicate question → System deduplicates before presenting
- Slow network → Show loading state, don't freeze UI
- Inappropriate language → AI detects and blocks, warns user

---

## 🕹️ User Flow

### **Main Flow: Chat → Quiz Challenge**

```
[Login] 
   ↓
[Dashboard] → Click "AI Hub" button
   ↓
[AI Hub Page]
   ├─→ [Chat Section]
   │      ├─ See online users list (filtered by university if desired)
   │      ├─ Click user → Open chat window
   │      ├─ Send/receive messages (real-time via Socket.io)
   │      ├─ AI suggests quiz challenge (if conversation >5 messages)
   │      └─ Click "Challenge to Quiz" button
   │            ↓
   └─→ [Quiz Battle Section]
          ├─ Match Lobby (both players see each other)
          ├─ 3-2-1 Countdown
          ├─ Question 1/10 (20 sec timer, 4 options)
          ├─ Show correct answer + scores after each Q
          ├─ Repeat for 10 questions
          ├─ Final Results Screen (winner, scores, stats)
          └─ Options: [Play Again] [Return to Chat] [Exit to Dashboard]
```

### **Alternative Flow: Direct Quiz Match**

```
[AI Hub] → Click "Find Quiz Opponent"
   ↓
[Matchmaking] (searching animation, ~5-10 sec)
   ↓
[Match Found] → Lobby with opponent
   ↓
[Quiz Game] (same as above)
   ↓
[Results] → [Challenge to Chat] or [Find New Opponent]
```

---

## 🧰 Functional Requirements

### **FR-1: AI Hub Page (`/ai-hub`)**

**User Story:** As a student, I want a central place to access chat and quiz features so I can easily find interactive activities.

**Acceptance Criteria:**
- Page accessible from main navigation bar
- Two prominent sections: "Real-Time Chat" and "Quiz Battle"
- Shows number of online users (e.g., "🟢 12 students online now")
- Dashboard widget shows quick stats: "5 friends online, 3 quiz challenges waiting"
- Mobile-responsive layout (works on phone screens)

**Screens:** `ai-hub-landing.png` (to be designed)

---

### **FR-2: Real-Time Chat System**

#### **FR-2.1: User List & Presence**
**User Story:** As a student, I want to see which students from other universities are online so I can start a conversation.

**Behaviors:**
- Display list of currently online users
- Show avatar, name, university, and online status (🟢 green dot)
- Filter by university (optional dropdown: "All Universities" | "VU" | "KTU" | etc.)
- Search bar to find specific users by name
- Auto-refresh every 30 seconds

#### **FR-2.2: Chat Window**
**User Story:** As a student, I want to send and receive messages in real-time so I can have natural conversations.

**Behaviors:**
- Click user → Opens chat window (modal or side panel)
- Message input field with "Send" button (Enter key also sends)
- Messages appear instantly (<500ms latency)
- Show timestamp for each message
- Show "typing..." indicator when other person is typing
- Display chat history (last 50 messages loaded initially, scroll up for more)
- Emoji support 🎉
- Character limit: 500 chars per message

#### **FR-2.3: AI Chat Assistance**
**User Story:** As a student, I want AI to suggest relevant quiz challenges based on my conversation so I can seamlessly transition to gaming.

**Behaviors:**
- After 5+ messages exchanged, AI analyzes conversation topic
- If topic = academic (e.g., "algorithms," "physics"), suggest knowledge quiz
- If topic = casual (e.g., "movies," "sports"), suggest leisure quiz
- Show suggestion as a card: "🤖 AI suggests: Challenge [User] to a [Topic] Quiz!"
- Click suggestion → Both users receive quiz invitation
- Other user can accept or decline (5-minute expiry)

#### **FR-2.4: AI Moderation**
**User Story:** As a platform, I want to prevent harassment and inappropriate content so users feel safe.

**Behaviors:**
- Every message runs through Vertex AI content filter before delivery
- Blocked content categories: hate speech, sexual content, violence, PII leaks
- If flagged → Message not delivered, user sees: "Message blocked for violating community guidelines"
- User warned after 3 violations → Account suspended after 5 violations
- Admin dashboard shows flagged messages for review

**Screens:**
- `chat-user-list.png`
- `chat-window.png`
- `chat-ai-suggestion.png`

---

### **FR-3: AI Competitive Quiz System**

#### **FR-3.1: Quiz Matchmaking**
**User Story:** As a student, I want to find an opponent quickly so I can start a quiz game without waiting.

**Behaviors:**
- Click "Find Opponent" button
- System matches with another student in matchmaking queue (FIFO)
- Match criteria: Currently online + opted into quiz mode
- If no match within 10 seconds → Prompt: "Invite a friend to chat or wait for more players"
- Lobby screen shows both players' avatars, names, universities
- 5-second countdown before quiz starts ("Get Ready! 5...4...3...")

#### **FR-3.2: AI Question Generation**
**User Story:** As a quiz player, I want fresh, varied questions every game so it never feels repetitive.

**Behaviors:**
- Vertex AI generates 10 unique questions per game
- Categories: General Knowledge, Science, History, Pop Culture, Sports, Technology, Geography
- Difficulty: Mix of easy (40%), medium (40%), hard (20%)
- Format: Multiple choice (4 options, 1 correct)
- Each question has 20-second timer
- Questions stored in MongoDB after generation for analytics (not reused immediately)

**Sample Prompt to Vertex AI:**
```
Generate a quiz question for university students.
Category: {random from list}
Difficulty: {easy/medium/hard}
Format: Multiple choice with 4 options.
Return JSON: {"question": "...", "options": ["A", "B", "C", "D"], "correct": "B", "explanation": "..."}
```

#### **FR-3.3: Quiz Gameplay**
**User Story:** As a quiz player, I want a fast-paced, competitive experience that feels like a game.

**Behaviors:**
- Display question and 4 options (A, B, C, D)
- Visual timer bar (20 seconds, color changes red at <5 sec)
- Both players select simultaneously (other player's choice hidden)
- After both answer OR timer expires → Show correct answer
- Display: ✅ for correct, ❌ for wrong
- Show both players' scores so far
- 3-second pause before next question
- Repeat for 10 questions

**Scoring:**
- Correct answer: +10 points
- Speed bonus: +5 points if answered in <5 seconds
- Wrong answer: 0 points

#### **FR-3.4: Results & Replay**
**User Story:** As a quiz player, I want to see my final score and compare with my opponent so I know if I won.

**Behaviors:**
- Final screen shows:
  - Winner announcement (confetti animation 🎉)
  - Final scores (Player 1: 85, Player 2: 70)
  - Accuracy stats (8/10 correct)
  - Average response time
- Options:
  - [Play Again] → Re-queue for matchmaking
  - [Challenge to Rematch] → Send invite to same opponent
  - [Start Chat] → Open chat window with opponent
  - [Return to AI Hub] → Exit to main page

**Screens:**
- `quiz-matchmaking.png`
- `quiz-lobby.png`
- `quiz-question-screen.png`
- `quiz-results.png`

---

### **FR-4: Dashboard Integration**

**User Story:** As a student, I want to access AI features from my dashboard so I don't have to search for them.

**Behaviors:**
- Add "AI Hub" widget to dashboard (next to "My Events," "My Badges")
- Widget shows:
  - 🟢 "3 friends online now"
  - 🎮 "5 quiz challenges waiting"
  - Button: "Open AI Hub"
- Notification badge if new chat message or quiz challenge received

**Screens:** `dashboard-ai-widget.png`

---

### **FR-5: Notification System**

**User Story:** As a student, I want to be notified when someone challenges me to a quiz or sends a chat message so I don't miss interactions.

**Behaviors:**
- Real-time notifications via Socket.io
- Notification types:
  - "New message from [User]"
  - "[User] challenged you to a quiz"
  - "Your quiz match is ready!"
- Notification appears as toast (bottom-right corner, 5-second auto-dismiss)
- Click notification → Navigate to relevant screen (chat or quiz)
- Browser notifications (if user grants permission)

---

## 📐 Model Requirements

| SPECIFICATION          | REQUIREMENT                        | RATIONALE                                                                 |
| ---------------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| Open vs Proprietary    | **Proprietary (Vertex AI)**       | Requires Google Cloud integration; superior quality for quiz generation   |
| Model Choice           | **Gemini 1.5 Flash**              | Fast (low latency), cost-effective, multimodal for future image quizzes  |
| Context Window         | **32K tokens**                    | Sufficient for chat history + quiz generation prompts                     |
| Modalities             | **Text (primary), Image (future)**| Text for v1; images for visual quiz questions in v2                       |
| Fine Tuning Capability | **Not needed initially**          | Gemini 1.5 Flash pre-trained; may fine-tune later for Lithuanian context |
| Latency                | **P50: <2s, P95: <3s**            | Users expect instant quiz questions; chat moderation must be <500ms       |
| Parameters             | **N/A (managed service)**         | Vertex AI abstracts infrastructure                                        |

---

## 🧮 Data Requirements

### **Fine-Tuning Purpose**
- **Not applicable for v1** (using pre-trained Gemini 1.5 Flash)
- **Future v2:** Fine-tune on Lithuanian university curriculum topics (e.g., local history, KTU-specific courses)

### **Data Preparation Plan**
1. **Quiz Question Database:**
   - Store generated questions in MongoDB for analytics
   - Track: question text, category, difficulty, correctness rate, play count
   - Schema: `{question: String, options: [String], correct: String, category: String, difficulty: String, timesPlayed: Number, correctnessRate: Number}`

2. **Chat Message Storage:**
   - Store chat history in MongoDB (encrypted at rest)
   - Schema: `{senderId: ObjectId, receiverId: ObjectId, message: String, timestamp: Date, moderationFlag: Boolean}`

3. **User Quiz Stats:**
   - Track per-user performance: games played, win rate, avg score, favorite categories
   - Schema: `{userId: ObjectId, gamesPlayed: Number, wins: Number, avgScore: Number, categories: Object}`

### **Quantity and Coverage Targets**
- **Week 1-4:** Generate 500+ unique quiz questions across 7 categories
- **Week 5-8:** Reach 1,000+ questions (avoid repetition)
- **Chat data:** Store all conversations (GDPR-compliant, user can delete)

### **Ongoing Collection Plan**
- AI generates new questions every game (never repeat within 30 days for same user)
- User feedback: "Report Question" button if inaccurate
- Admin review flagged questions weekly

### **Iterative Fine-Tuning Plan (Future)**
- After 1,000+ games played, analyze which questions have:
  - Low correctness rate (<30% = too hard or unclear)
  - High skip rate (users confused)
- Use this data to improve prompt engineering or fine-tune model

---

## 💬 Prompt Requirements

### **Policy and Refusal Handling**

**Chat Moderation Prompt:**
```
You are a content moderator for a university social platform.
Analyze this message and classify it as SAFE or UNSAFE.

Message: "{user_message}"

UNSAFE categories:
- Hate speech, discrimination
- Sexual content
- Violence or threats
- Personal information (PII) leaks
- Spam or scams

If UNSAFE, return: {"safe": false, "category": "hate_speech"}
If SAFE, return: {"safe": true}
```

**Refusal Example:** If user tries to bypass filter (e.g., "How do I hack someone's account?"), AI responds:
```json
{"safe": false, "category": "harmful_intent", "message": "This question violates our guidelines."}
```

### **Personalization Rules**

**Quiz Question Generation Prompt:**
```
Generate a quiz question for university students in Lithuania.

User preferences:
- Difficulty: {user.preferredDifficulty || "medium"}
- Favorite categories: {user.favoriteCategories || "General Knowledge"}
- Avoid topics: {user.avoidedTopics || []}

Category: {randomCategory}
Difficulty: {difficulty}
Language: English (Lithuanian support in v2)

Format:
{
  "question": "Clear, concise question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": "B",
  "explanation": "Why this is the correct answer",
  "category": "Science",
  "difficulty": "medium"
}

Rules:
- Questions must be factually accurate (no opinions)
- Avoid overly obscure trivia
- Include mix of local (Lithuanian) and global topics
- No offensive content
```

### **Output Format Guarantees**

**JSON Schema Enforcement:**
All AI responses must be valid JSON. If parsing fails, retry with schema reminder:
```
Your previous response was not valid JSON. Please return ONLY valid JSON matching this schema:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correct": "string (A/B/C/D)",
  "explanation": "string"
}
```

**Retry Logic:**
- Max 3 retries for malformed responses
- If still fails → Use fallback question from pre-generated pool

### **Accuracy Target**

- **Quiz Questions:** 95% factual accuracy (measured by user reports + spot checks)
- **Chat Moderation:** 90% precision (false positives <10%, false negatives <5%)
- **AI Suggestions (quiz challenges):** 70% acceptance rate (users click suggested challenge)

---

## 🧪 Testing & Measurement

### **Offline Eval Plan**

**Golden Set for Quiz Questions:**
- Create 100-question golden set (manually verified by domain experts)
- Categories: 15 per category (Science, History, Pop Culture, etc.)
- Difficulty distribution: 40 easy, 40 medium, 20 hard
- **Pass Threshold:** AI-generated questions must match golden set quality (95% accuracy)

**Rubric for Question Quality:**
| CRITERIA              | SCORE 1-5 | WEIGHT |
| --------------------- | --------- | ------ |
| Factual Accuracy      | 5         | 40%    |
| Clarity (no ambiguity)| 4         | 30%    |
| Appropriate Difficulty| 4         | 20%    |
| Engaging/Fun          | 3         | 10%    |

**Chat Moderation Golden Set:**
- 200 sample messages: 100 safe, 100 unsafe (across all categories)
- **Pass Threshold:** 90% precision, 95% recall

### **Online (A/B) Testing Plan**

**Phase 1 (Weeks 1-2): Beta Testing**
- Invite 20 students (10 from VU, 10 from KTU)
- Track: chat messages sent, quiz games completed, bugs reported
- Collect qualitative feedback via survey

**Phase 2 (Weeks 3-4): Soft Launch**
- Open to 50% of active users (randomized)
- A: Control (no AI Hub), B: Treatment (AI Hub enabled)
- **Guardrails:**
  - If quiz completion rate <50%, pause rollout
  - If chat errors >5%, rollback immediately

**Phase 3 (Weeks 5-8): Full Rollout**
- 100% of users
- Monitor KPIs daily (dashboard alerts if metrics drop >20%)

### **Live Performance Tracking**

**Real-Time Metrics (Socket.io Dashboard):**
- Active chat users (live count)
- Quiz games in progress
- Average response time (chat delivery, quiz generation)
- Error rate (failed messages, AI timeouts)

**Daily KPI Dashboard:**
- New chat users (daily, weekly, cumulative)
- Quiz games played (daily, weekly, cumulative)
- D1, D7 retention rates
- User feedback scores (NPS)

**Alerting:**
- Slack alert if chat latency >1 second (p95)
- Email alert if quiz generation fails >5 times/hour
- PagerDuty if error rate >10%

---

## ⚠️ Risks & Mitigations

| RISK                                      | LIKELIHOOD | IMPACT | MITIGATION                                                                                     |
| ----------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------- |
| AI generates factually incorrect questions| Medium     | High   | Golden set validation, user "Report Question" button, weekly admin review                      |
| Chat system fails to deliver messages     | Low        | High   | Socket.io fallback to polling, retry logic (3 attempts), show "Message failed" UI with retry   |
| Vertex AI API timeout (>5s latency)       | Medium     | Medium | Set 5s timeout, use pre-generated question pool as fallback, cache frequent questions          |
| Students abuse chat (spam, harassment)    | Medium     | High   | AI moderation, rate limiting (max 10 messages/minute), user reporting, ban system              |
| Low adoption (students don't use AI Hub)  | High       | High   | Dashboard widget with notifications, gamify with badges ("First Quiz Winner"), email campaigns |
| Quiz matchmaking fails (no opponents)     | Medium     | Medium | Allow "Play vs. AI" mode (single-player), show waitlist size, send notifications when match found|
| MongoDB connection drops mid-game         | Low        | High   | Redis session backup, auto-reconnect with exponential backoff, show "Reconnecting..." UI       |
| GDPR violation (chat data mishandled)     | Low        | Critical| Encrypt all chat data at rest, user "Delete Conversation" button, data retention policy (30 days)|
| Vertex AI costs exceed budget             | Medium     | Medium | Set daily spending cap ($50/day), monitor token usage, optimize prompts to reduce tokens       |
| University blocks AI Hub (policy concern) | Low        | High   | Pre-launch approval from VU administration, transparent privacy policy, opt-in design          |

---

## 💰 Costs

### **Development Costs**

| ITEM                        | EFFORT       | COST (if outsourced) |
| --------------------------- | ------------ | -------------------- |
| UI/UX Design                | 40 hours     | $2,000               |
| Frontend Development        | 80 hours     | $4,000               |
| Backend API Development     | 60 hours     | $3,000               |
| Vertex AI Integration       | 40 hours     | $2,000               |
| Socket.io Real-Time Setup   | 30 hours     | $1,500               |
| Testing & QA                | 30 hours     | $1,500               |
| **TOTAL DEVELOPMENT**       | **280 hours**| **$14,000**          |

### **Operational Costs (Monthly)**

| ITEM                     | ESTIMATE         | NOTES                                                  |
| ------------------------ | ---------------- | ------------------------------------------------------ |
| Vertex AI (Gemini Flash) | $50-150/month    | ~10K API calls/month @ $0.01/1K tokens                 |
| MongoDB Atlas            | $25/month        | Included in existing plan (M10 cluster)                |
| Socket.io Hosting        | $0               | Runs on Next.js server (no extra cost)                 |
| Google Cloud Storage     | $5/month         | Chat history backups (10GB)                            |
| Monitoring (Sentry)      | $0               | Free tier (5K events/month)                            |
| **TOTAL MONTHLY**        | **$80-180/month**| Scales with usage                                      |

**Cost Optimization:**
- Use caching for frequent questions (reduce AI calls by 30%)
- Batch API requests where possible
- Set daily spending cap on Vertex AI ($5/day = $150/month max)

---

## 🔗 Assumptions & Dependencies

### **Assumptions**

1. **User Behavior:** Students will opt into real-time features and keep app open during quiz games
2. **Network Reliability:** Students have stable internet (Wi-Fi or 4G) for real-time chat/quiz
3. **AI Accuracy:** Vertex AI Gemini 1.5 Flash provides 95%+ factually correct answers without fine-tuning
4. **University Approval:** VU administration allows AI features (no policy blocks)
5. **Language:** v1 is English-only; Lithuanian students are comfortable with English quizzes
6. **Device Support:** Most students use laptops or smartphones (Chrome, Safari, Edge browsers)
7. **Adoption Rate:** 10% of existing Arisze users will try AI Hub in first 2 weeks
8. **Vertex AI Availability:** Google Cloud Vertex AI has 99.9% uptime SLA
9. **Budget Approval:** Budget of $200/month for operational costs is approved
10. **Timeline:** 8-week development + 4-week testing = 12 weeks total to launch

### **Dependencies**

1. **Google Cloud Account:** Must have Vertex AI API enabled and billing configured
2. **MongoDB Schema Updates:** Add collections for `chatMessages`, `quizGames`, `quizQuestions`
3. **Socket.io Integration:** Requires WebSocket support (upgrade Next.js server if needed)
4. **NextAuth Session:** Must expose `userId` in session for real-time user identification
5. **UI/UX Design:** Figma mockups must be approved before frontend development starts
6. **Beta Testers:** Recruit 20 students for beta testing (weeks 9-10)
7. **Legal Review:** Privacy policy updated to cover AI chat and quiz data storage
8. **GDPR Compliance:** Data retention policy defined (30-day chat history, 90-day quiz stats)
9. **Admin Dashboard:** Build admin panel to review flagged chat messages and quiz questions
10. **Load Testing:** Simulate 100 concurrent users before full launch

---

## 🔒 Compliance/Privacy/Legal

### **Regulatory Notes**

**GDPR Compliance (EU/Lithuania):**
- **Lawful Basis:** Legitimate interest (providing social platform features) + user consent
- **Data Minimization:** Collect only necessary data (chat messages, quiz scores, timestamps)
- **Right to Access:** Users can export their chat history and quiz stats via dashboard
- **Right to Erasure:** Users can delete conversations (30-day retention, then auto-purge)
- **Data Breach Notification:** Report breaches to Lithuanian DPA within 72 hours

**University Policies:**
- Obtain written approval from VU, KTU, VMU data protection officers
- Ensure no sharing of student data with third parties (Vertex AI processes data but doesn't store)
- Transparent privacy policy (link in footer): "How we use AI to improve your experience"

### **Data Governance**

**Storage:**
- **Chat Messages:** MongoDB (encrypted at rest via Atlas), indexed by `userId` and `timestamp`
- **Quiz Data:** MongoDB (questions, user scores, game sessions)
- **Vertex AI Logs:** Google Cloud retains API logs for 30 days (we don't control this)

**Retention:**
- **Chat History:** 30 days (users can delete anytime)
- **Quiz Stats:** 90 days (for leaderboard, then anonymized)
- **AI-Generated Questions:** Stored permanently for analytics (no PII attached)

**Access Controls:**
- **Developers:** Read-only access to production DB (write via API only)
- **Admins:** Can view flagged messages but not edit user content
- **AI Moderation:** Automated (no human review unless user reports)

**Encryption:**
- **In Transit:** TLS 1.3 for all API calls (HTTPS only)
- **At Rest:** MongoDB Atlas encryption enabled
- **Vertex AI:** Data encrypted in transit to Google Cloud

### **User Consent**

**Opt-In Design:**
- First time user opens AI Hub → Modal: "AI Hub uses Vertex AI to generate quiz questions and moderate chat. Do you agree to our [Privacy Policy]?" [Agree] [Decline]
- If decline → AI Hub disabled, user can re-enable in settings

**Transparency:**
- Chat window footer: "🤖 AI-powered moderation enabled"
- Quiz screen footer: "Questions generated by AI"

---

## 📣 GTM/Rollout Plan

### **Milestones**

| WEEK | MILESTONE                          | DELIVERABLES                                                                 |
| ---- | ---------------------------------- | ---------------------------------------------------------------------------- |
| 1-2  | Design & Specs                     | Figma mockups approved, MongoDB schema finalized, Vertex AI prompt tested    |
| 3-4  | Frontend Development               | AI Hub page, chat UI, quiz UI built (no backend yet)                         |
| 5-6  | Backend Development                | Socket.io setup, Vertex AI integration, MongoDB APIs                         |
| 7-8  | Integration & Testing              | End-to-end flows working, bug fixes, load testing (100 concurrent users)     |
| 9-10 | Beta Launch                        | 20 students test, feedback collected, critical bugs fixed                    |
| 11   | Soft Launch (50% rollout)          | A/B test, monitor KPIs, iterate based on data                                |
| 12   | Full Launch (100% rollout)         | All users, marketing push, press release                                     |

### **Launch Strategy**

**Pre-Launch (Weeks 1-8):**
- Internal demo to university stakeholders (VU, KTU admins)
- Social media teasers: "Something new is coming to Arisze... 🤖"
- Email to existing users: "Get ready for AI-powered fun!"

**Beta Launch (Weeks 9-10):**
- Invite-only for 20 students (selected from most active users)
- Daily feedback surveys ("Rate your experience 1-5")
- Bug bounty: €50 gift card for critical bug reports

**Soft Launch (Week 11):**
- Enable AI Hub for 50% of users (randomized)
- In-app banner: "✨ New Feature: Try AI Hub!"
- Dashboard notification badge (red dot on AI Hub icon)

**Full Launch (Week 12):**
- Enable for 100% of users
- **Marketing Push:**
  - Instagram/TikTok video: "Watch students compete in AI Quiz Battle!"
  - LinkedIn post: "Arisze introduces AI-powered social features"
  - University newsletters: Feature article in VU/KTU campus magazines
  - Press release: Send to Lithuanian tech media (e.g., Verslo Žinios, 15min Tech)
- **In-App Onboarding:**
  - First-time users see tutorial: "Welcome to AI Hub! Here's how it works..."
  - Tooltip pointers: "👉 Click here to start your first quiz"

### **Phased Rollout**

**Phase 1: Beta (20 users, Weeks 9-10)**
- **Goal:** Validate core flows, identify critical bugs
- **Success Criteria:** 80%+ positive feedback, <5 critical bugs

**Phase 2: Soft Launch (50% of users, Week 11)**
- **Goal:** Test scalability, measure KPIs
- **Success Criteria:** Chat latency <500ms, quiz generation <3s, 40% D7 retention
- **Rollback Plan:** If error rate >10%, disable AI Hub and fix issues

**Phase 3: Full Launch (100% of users, Week 12+)**
- **Goal:** Achieve KPI targets (50 chat users, 200 quiz games, 40% retention)
- **Ongoing:** Monitor metrics weekly, iterate based on user feedback

**Post-Launch (Weeks 13-16):**
- Survey users: "What features do you want next?"
- Analyze data: Which quiz categories are most popular? Where do users drop off?
- Plan v2 features: Group chat, quiz tournaments, leaderboards

---

## 📌 Summary & Next Steps

**This PRD defines v1 of Arisze AI Hub:**
- ✅ Real-time 1-on-1 chat with AI moderation
- ✅ AI-generated competitive quiz games (10 questions, 2 players)
- ✅ Dashboard integration and notifications
- ✅ GDPR-compliant data handling
- ✅ 12-week development timeline

**Immediate Next Steps:**
1. **Set up Google Cloud Project** with Vertex AI API enabled
2. **Design Figma mockups** for AI Hub page, chat UI, quiz UI
3. **Update MongoDB schema** (add `chatMessages`, `quizGames`, `quizQuestions` collections)
4. **Test Vertex AI prompts** (validate question generation quality)
5. **Recruit beta testers** (20 students from VU/KTU)

**Questions or feedback?** Review this PRD and confirm:
- Scope: Does v1 cover the right features?
- Risks: Are the top risks adequately mitigated?
- KPIs: Are 50 users, 200 games, 40% retention realistic for 8 weeks?

---

**Document Control:**
- **Author:** Product Manager (AI Assistant)
- **Reviewed by:** [Your Name]
- **Approved by:** [TBD]
- **Last Updated:** October 23, 2025
- **Version:** 1.0
