import './ChatHeader.css';

interface ChatHeaderProps {
  onClose?: () => void;
}

export const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <div className="chat-header">
      <h2 className="chat-header-title">Support Chat</h2>
      {onClose && (
        <button className="chat-header-close" onClick={onClose} aria-label="Close chat">
          ×
        </button>
      )}
    </div>
  );
};

