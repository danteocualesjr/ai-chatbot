# Chatbot Enhancement Plan

## Overview
This plan outlines the implementation of two key features to make the chatbot more useful:
1. **Chat History** - Store and manage conversations locally
2. **Enhanced AI Personality** - Customize tone and add business knowledge

---

## Priority & Dependencies

### Build Order Recommendation
**Feature 1 (Chat History) → Feature 2 (Enhanced AI Personality)**

**Why this order?**
- Chat history provides immediate value to users
- Once conversations are saved, enhanced personality makes them more valuable
- Feature 2 can be implemented independently without affecting Feature 1
- Users can start benefiting from saved chats right away

---

## Feature 1: Chat History with Local Storage

### Goal
Store conversations in browser local storage so users can return to previous chats without authentication.

### User Value
- Resume conversations later
- Reference past answers
- Multiple conversation threads
- No login required

### Implementation Steps

#### Step 1: Create Storage Service
**File:** `src/services/storageService.ts`
- Create functions to save/load conversations from localStorage
- Structure: Store array of conversation objects
- Each conversation: `{ id, title, messages, createdAt, updatedAt }`
- Handle localStorage errors gracefully (quota exceeded, disabled, etc.)

**Key Functions:**
- `saveConversation(conversation)` - Save or update a conversation
- `loadConversations()` - Get all saved conversations
- `loadConversation(id)` - Get a specific conversation
- `deleteConversation(id)` - Remove a conversation
- `clearAllConversations()` - Reset storage

#### Step 2: Update Chat Component State Management
**File:** `src/components/Chat.tsx`
- Add conversation ID state (null for new, string for existing)
- Auto-save messages to localStorage after each exchange
- Load conversation on mount if ID provided
- Generate conversation titles from first user message (or "New Chat")

**State Changes:**
- `currentConversationId: string | null`
- `conversations: Conversation[]` (for sidebar)
- Auto-save after each message pair (user + AI response)

#### Step 3: Create Conversation Sidebar
**File:** `src/components/ConversationSidebar.tsx`
- List of all saved conversations
- Show conversation title and last message preview
- Click to switch conversations
- "New Chat" button at top
- Delete conversation option (with confirmation)

**UI Elements:**
- Collapsible sidebar (can be hidden on mobile)
- Conversation list with timestamps
- Active conversation highlighted
- Empty state when no conversations

#### Step 4: Update Chat Header
**File:** `src/components/ChatHeader.tsx`
- Add "New Chat" button
- Show current conversation title
- Toggle sidebar button (hamburger menu on mobile)

#### Step 5: Add Conversation Management
**File:** `src/components/Chat.tsx`
- Handle conversation switching
- Create new conversation
- Auto-save on message send/receive
- Update conversation title intelligently

**Logic:**
- On "New Chat": Clear messages, reset to greeting, create new conversation ID
- On conversation switch: Load messages, update state, scroll to bottom
- Auto-save: Debounce saves (wait 500ms after last message)

#### Step 6: Add Styling
**File:** `src/components/ConversationSidebar.css`
- Clean sidebar design matching chat interface
- Hover states for conversation items
- Mobile-responsive (overlay on mobile, sidebar on desktop)
- Smooth transitions

### Technical Considerations
- **Storage Limit:** localStorage typically 5-10MB. Add warning if approaching limit
- **Data Structure:** Use JSON.stringify/parse for storage
- **Migration:** Handle schema changes if needed in future
- **Performance:** Debounce auto-saves to avoid excessive writes

### Files to Create/Modify
- ✅ Create: `src/services/storageService.ts`
- ✅ Create: `src/components/ConversationSidebar.tsx`
- ✅ Create: `src/components/ConversationSidebar.css`
- ✅ Modify: `src/components/Chat.tsx`
- ✅ Modify: `src/components/ChatHeader.tsx`
- ✅ Modify: `src/components/Chat.css` (for sidebar layout)

---

## Feature 2: Enhanced AI Personality

### Goal
Customize the assistant's tone and add knowledge about products/services to make responses feel branded and on-point.

### User Value
- Responses match brand voice
- Accurate product/service information
- Consistent, helpful experience
- Professional and trustworthy

### Implementation Steps

#### Step 1: Create Configuration System
**File:** `src/config/aiConfig.ts`
- Centralized configuration for AI personality
- System prompt template
- Product/service knowledge base
- Brand guidelines

**Structure:**
```typescript
export const aiConfig = {
  systemPrompt: string,
  productKnowledge: string[],
  brandVoice: {
    tone: string,
    style: string,
    examples: string[]
  }
}
```

#### Step 2: Create Knowledge Base
**File:** `src/config/knowledgeBase.ts` or `src/config/knowledgeBase.json`
- Store product/service information
- FAQ answers
- Company information
- Common support scenarios

**Options:**
- Simple TypeScript object (easy to edit)
- JSON file (non-developers can edit)
- Markdown file (readable, version-controlled)

#### Step 3: Update Chat Service
**File:** `src/services/chatService.ts`
- Import AI configuration
- Build dynamic system prompt from config
- Include relevant knowledge in context
- Add function to inject knowledge based on user query

**Enhancements:**
- System prompt includes brand voice guidelines
- Product knowledge injected into context
- Temperature/top_p tuning for consistent tone

#### Step 4: Add Context-Aware Responses
**File:** `src/services/chatService.ts`
- Detect when user asks about products/services
- Inject relevant knowledge into system prompt
- Use function calling or prompt engineering to reference knowledge

**Approach Options:**
1. **Simple:** Include all knowledge in system prompt (works for small knowledge bases)
2. **Advanced:** Use embeddings to find relevant knowledge chunks (scales better)

#### Step 5: Create Configuration UI (Optional)
**File:** `src/components/AIConfigPanel.tsx` (optional, for admins)
- Allow editing AI personality without code changes
- Update knowledge base through UI
- Preview changes before saving

**Note:** This is optional - can start with code-based config, add UI later if needed.

### Technical Considerations
- **Prompt Engineering:** System prompt length affects token usage. Keep it concise but informative
- **Knowledge Size:** Large knowledge bases may need chunking or embeddings
- **Version Control:** Keep config files in git for tracking changes
- **Testing:** Test with various queries to ensure knowledge is used correctly

### Files to Create/Modify
- ✅ Create: `src/config/aiConfig.ts`
- ✅ Create: `src/config/knowledgeBase.ts` (or .json/.md)
- ✅ Modify: `src/services/chatService.ts`
- ✅ Optional: `src/components/AIConfigPanel.tsx`

---

## Implementation Roadmap

### Phase 1: Chat History (Week 1)
**Days 1-2:** Storage service + basic save/load
**Days 3-4:** Sidebar UI + conversation switching
**Days 5-6:** Auto-save + polish + testing

### Phase 2: Enhanced AI Personality (Week 2)
**Days 1-2:** Configuration system + knowledge base
**Days 3-4:** Update chat service + integrate knowledge
**Days 5-6:** Testing + refinement + documentation

### Quick Win Option
If you want faster results, you can implement a simplified version:
- **Chat History:** Just auto-save current conversation (no sidebar initially)
- **AI Personality:** Start with just updating the system prompt in `chatService.ts`

---

## Success Metrics

### Chat History
- Users can resume conversations after page refresh
- Multiple conversation threads work smoothly
- Storage doesn't cause performance issues

### Enhanced AI Personality
- Responses feel branded and consistent
- Product/service questions get accurate answers
- Tone matches brand guidelines

---

## Next Steps

1. **Review this plan** - Does the order and approach make sense?
2. **Customize knowledge base** - What products/services should the AI know about?
3. **Define brand voice** - What tone should the assistant use?
4. **Start with Feature 1** - Begin implementing chat history

---

## Questions to Answer Before Starting

### For Chat History:
- How many conversations should be stored? (Set a limit?)
- Should conversations expire after X days?
- Do we need conversation search/filter?

### For AI Personality:
- What products/services need to be in the knowledge base?
- What's the brand voice? (Professional? Friendly? Casual?)
- Are there specific FAQs or common questions to address?
- Should the AI have access to real-time data (pricing, availability)?

---

## Notes

- Both features can be implemented incrementally
- Start simple, add complexity as needed
- Test with real users early and often
- Keep the code maintainable and well-documented

