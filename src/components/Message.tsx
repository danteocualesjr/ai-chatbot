import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Message.css';

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  imageUrl?: string;
}

export const Message = ({ content, role, imageUrl }: MessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
      <div className="message-content">
        {imageUrl && (
          <div className="message-image-container">
            <img src={imageUrl} alt="Uploaded" className="message-image" />
          </div>
        )}
        {isUser ? (
          <p>{content || (imageUrl ? '📷 Image' : '')}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

