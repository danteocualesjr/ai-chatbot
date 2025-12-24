import './ChatHeader.css';

interface ChatHeaderProps {
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export const ChatHeader = ({ onNewChat, onToggleSidebar, sidebarOpen }: ChatHeaderProps) => {
  return (
    <div className="chat-header">
      {onToggleSidebar && (
        <button 
          className="chat-header-menu" 
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}
      <h2 className="chat-header-title">Support Chat</h2>
      {onNewChat && (
        <button 
          className="chat-header-new" 
          onClick={onNewChat}
          aria-label="New chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Chat</span>
        </button>
      )}
    </div>
  );
};

