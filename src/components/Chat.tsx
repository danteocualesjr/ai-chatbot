import { useState, useEffect, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { Message } from './Message';
import { sendMessage, type Message as ChatMessage } from '../services/chatService';
import './Chat.css';

interface MessageState {
  role: 'user' | 'assistant';
  content: string;
}

const hasApiKey = () => {
  return !!import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'your_api_key_here';
};

export const Chat = () => {
  const initialMessage: MessageState = hasApiKey()
    ? {
        role: 'assistant',
        content: 'Hey! How can I help you today?',
      }
    : {
        role: 'assistant',
        content: '⚠️ **Setup Required**\n\nTo use this chatbot, please configure your OpenAI API key:\n\n1. Create a `.env` file in the project root\n2. Add: `VITE_OPENAI_API_KEY=your_actual_api_key`\n3. Restart the development server\n\nGet your API key from [OpenAI Platform](https://platform.openai.com/api-keys)',
      };

  const [messages, setMessages] = useState<MessageState[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (userMessage: string) => {
    if (!hasApiKey()) {
      const errorMessage: MessageState = {
        role: 'assistant',
        content: '⚠️ **API Key Not Configured**\n\nPlease set `VITE_OPENAI_API_KEY` in your `.env` file and restart the development server.\n\nGet your API key from [OpenAI Platform](https://platform.openai.com/api-keys)',
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Add user message immediately
    const newUserMessage: MessageState = {
      role: 'user',
      content: userMessage,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Convert messages to API format
      const apiMessages: ChatMessage[] = messages
        .filter((msg) => msg.role !== 'assistant' || msg.content !== 'Hey! How can I help you today?')
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
      <ChatHeader />
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

