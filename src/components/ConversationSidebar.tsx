import { useEffect, useState } from 'react';
import { loadConversations, deleteConversation, type Conversation } from '../services/storageService';
import './ConversationSidebar.css';

interface ConversationSidebarProps {
  isOpen: boolean;
  currentConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onClose: () => void;
}

export const ConversationSidebar = ({
  isOpen,
  currentConversationId,
  onSelectConversation,
  onClose,
}: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Load conversations when sidebar opens
    if (isOpen) {
      const loaded = loadConversations();
      setConversations(loaded);
    }
  }, [isOpen]);

  // Refresh conversations when current conversation changes (after save)
  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);
  }, [currentConversationId]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(id);
      const updated = loadConversations();
      setConversations(updated);
      if (currentConversationId === id) {
        onSelectConversation(null);
      }
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getPreview = (messages: Conversation['messages']): string => {
    // Get last user message or last assistant message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i].content.substring(0, 50);
      }
    }
    if (messages.length > 0) {
      return messages[messages.length - 1].content.substring(0, 50);
    }
    return 'Empty conversation';
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <div className={`conversation-sidebar ${!isOpen ? 'mobile-hidden' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-left">
            <button 
              className="sidebar-collapse-toggle" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand conversations" : "Collapse conversations"}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={isCollapsed ? 'collapsed' : ''}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <h3>Conversations</h3>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            ×
          </button>
        </div>
        <div className="sidebar-content">
          <div className={`sidebar-content-inner ${isCollapsed ? 'collapsed' : ''}`}>
            {conversations.length === 0 ? (
              <div className="sidebar-empty">
                <p>No conversations yet</p>
                <p className="sidebar-empty-hint">Start a new chat to see it here</p>
              </div>
            ) : (
              <div className="conversation-list">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      currentConversationId === conversation.id ? 'active' : ''
                    }`}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="conversation-item-content">
                      <div className="conversation-title">{conversation.title}</div>
                      <div className="conversation-preview">{getPreview(conversation.messages)}</div>
                      <div className="conversation-meta">
                        <span className="conversation-date">{formatDate(conversation.updatedAt)}</span>
                        <span className="conversation-count">
                          {conversation.messages.filter(m => m.role === 'user').length} messages
                        </span>
                      </div>
                    </div>
                    <button
                      className="conversation-delete"
                      onClick={(e) => handleDelete(e, conversation.id)}
                      aria-label="Delete conversation"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

