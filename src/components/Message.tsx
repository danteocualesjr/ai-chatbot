import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Message.css';

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export const Message = ({ content, role }: MessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
      <div className="message-content">
        {isUser ? (
          <p>{content}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

