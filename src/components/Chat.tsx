import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { Message } from './Message';
import { sendMessage, type Message as ChatMessage } from '../services/chatService';
import {
  generateConversationId,
  generateConversationTitle,
  saveConversation,
  loadConversation,
  type Conversation,
} from '../services/storageService';
import './Chat.css';

interface MessageState {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  conversationId?: string | null;
  onConversationChange?: (id: string | null) => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const hasApiKey = () => {
  return !!import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'your_api_key_here';
};

const getInitialMessage = (): MessageState => {
  return hasApiKey()
    ? {
        role: 'assistant',
        content: 'Hey! How can I help you today?',
      }
    : {
        role: 'assistant',
        content: '⚠️ **Setup Required**\n\nTo use this chatbot, please configure your OpenAI API key:\n\n1. Create a `.env` file in the project root\n2. Add: `VITE_OPENAI_API_KEY=your_actual_api_key`\n3. Restart the development server\n\nGet your API key from [OpenAI Platform](https://platform.openai.com/api-keys)',
      };
};

export const Chat = ({ 
  conversationId: propConversationId, 
  onConversationChange,
  onToggleSidebar,
  sidebarOpen,
}: ChatProps = {}) => {
  const [conversationId, setConversationId] = useState<string | null>(propConversationId || null);
  const [messages, setMessages] = useState<MessageState[]>([getInitialMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversation on mount or when conversationId changes
  useEffect(() => {
    if (conversationId) {
      const conversation = loadConversation(conversationId);
      if (conversation && conversation.messages.length > 0) {
        setMessages(conversation.messages);
      }
    } else {
      // New conversation - reset to initial message
      setMessages([getInitialMessage()]);
    }
  }, [conversationId]);

  // Auto-save conversation when messages change
  const autoSave = useCallback((msgs: MessageState[]) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Skip saving if only initial message exists
    const hasUserMessages = msgs.some(msg => msg.role === 'user');
    if (!hasUserMessages) return;

    // Debounce save by 500ms
    saveTimeoutRef.current = setTimeout(() => {
      const id = conversationId || generateConversationId();
      const title = generateConversationTitle(
        msgs.find(msg => msg.role === 'user')?.content || 'New Chat'
      );

      const conversation: Conversation = {
        id,
        title,
        messages: msgs,
        createdAt: conversationId ? Date.now() : Date.now(), // Keep original if updating
        updatedAt: Date.now(),
      };

      saveConversation(conversation);
      
      if (!conversationId) {
        setConversationId(id);
        onConversationChange?.(id);
      }
    }, 500);
  }, [conversationId, onConversationChange]);

  // Auto-save when messages change
  useEffect(() => {
    autoSave(messages);
  }, [messages, autoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([getInitialMessage()]);
    onConversationChange?.(null);
  };

  const handleSend = async (userMessage: string) => {
    if (!hasApiKey()) {
      const errorMessage: MessageState = {
        role: 'assistant',
        content: '⚠️ **API Key Not Configured**\n\nPlease set `VITE_OPENAI_API_KEY` in your `.env` file and restart the development server.\n\nGet your API key from [OpenAI Platform](https://platform.openai.com/api-keys)',
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Ensure we have a conversation ID
    if (!conversationId) {
      const newId = generateConversationId();
      setConversationId(newId);
      onConversationChange?.(newId);
    }

    // Add user message immediately
    const newUserMessage: MessageState = {
      role: 'user',
      content: userMessage,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Convert messages to API format (exclude initial greeting)
      const apiMessages: ChatMessage[] = messages
        .filter((msg) => {
          // Skip the initial greeting message
          if (msg.role === 'assistant' && msg.content === 'Hey! How can I help you today?') {
            return false;
          }
          // Skip setup messages
          if (msg.role === 'assistant' && msg.content.includes('Setup Required')) {
            return false;
          }
          return true;
        })
        .map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }));

      // Add current user message
      apiMessages.push({
        role: 'user',
        content: userMessage,
      });

      // Get AI response
      const aiResponse = await sendMessage(apiMessages);

      // Add AI response
      const newAiMessage: MessageState = {
        role: 'assistant',
        content: aiResponse,
      };
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      const errorMessage: MessageState = {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <ChatHeader 
        onNewChat={handleNewChat} 
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      <div className="chat-messages">
        {messages.map((message, index) => (
          <Message key={index} content={message.content} role={message.role} />
        ))}
        {isLoading && (
          <div className="message message-assistant">
            <div className="message-content">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
};

