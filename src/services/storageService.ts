export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'ai-chatbot-conversations';
const MAX_CONVERSATIONS = 50; // Limit to prevent storage issues

/**
 * Generate a unique conversation ID
 */
export const generateConversationId = (): string => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a conversation title from the first user message
 */
export const generateConversationTitle = (firstUserMessage: string): string => {
  // Take first 50 characters, remove markdown, trim
  const cleaned = firstUserMessage
    .replace(/[#*_`]/g, '')
    .trim()
    .substring(0, 50);
  return cleaned || 'New Chat';
};

/**
 * Save a conversation to localStorage
 */
export const saveConversation = (conversation: Conversation): void => {
  try {
    const conversations = loadConversations();
    
    // Update existing or add new
    const index = conversations.findIndex(c => c.id === conversation.id);
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }

    // Sort by updatedAt (newest first)
    conversations.sort((a, b) => b.updatedAt - a.updatedAt);

    // Limit to max conversations
    if (conversations.length > MAX_CONVERSATIONS) {
      conversations.splice(MAX_CONVERSATIONS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversation:', error);
    // Handle quota exceeded or other storage errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Try to free up space by removing oldest conversations
      const conversations = loadConversations();
      if (conversations.length > 10) {
        conversations.splice(10);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
        } catch (e) {
          console.error('Failed to free up storage space:', e);
        }
      }
    }
  }
};

/**
 * Load all conversations from localStorage
 */
export const loadConversations = (): Conversation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const conversations = JSON.parse(data) as Conversation[];
    // Validate and filter out invalid entries
    return conversations.filter(conv => 
      conv.id && 
      conv.messages && 
      Array.isArray(conv.messages) &&
      conv.createdAt &&
      conv.updatedAt
    );
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
};

/**
 * Load a specific conversation by ID
 */
export const loadConversation = (id: string): Conversation | null => {
  try {
    const conversations = loadConversations();
    return conversations.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return null;
  }
};

/**
 * Delete a conversation by ID
 */
export const deleteConversation = (id: string): void => {
  try {
    const conversations = loadConversations();
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete conversation:', error);
  }
};

/**
 * Clear all conversations
 */
export const clearAllConversations = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear conversations:', error);
  }
};

/**
 * Get storage usage info (approximate)
 */
export const getStorageInfo = (): { used: number; available: boolean } => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const used = data ? new Blob([data]).size : 0;
    return { used, available: true };
  } catch (error) {
    return { used: 0, available: false };
  }
};

