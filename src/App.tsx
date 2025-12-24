import { useState, useEffect } from 'react';
import { Chat } from './components/Chat';
import { ConversationSidebar } from './components/ConversationSidebar';
import './App.css';

function App() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // On desktop, sidebar should always be visible
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleConversationChange = (id: string | null) => {
    setCurrentConversationId(id);
  };

  const handleSelectConversation = (id: string | null) => {
    setCurrentConversationId(id);
    // Close sidebar on mobile after selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="app">
      <ConversationSidebar
        isOpen={sidebarOpen || !isMobile}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-chat-wrapper">
        <Chat
          conversationId={currentConversationId}
          onConversationChange={handleConversationChange}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
      </div>
    </div>
  );
}

export default App;
