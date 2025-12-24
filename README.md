# AI Customer Support Chatbot

A modern, Intercom-style customer support chatbot built with React, TypeScript, and OpenAI's GPT API.

## Features

- 🎨 Clean, modern chat interface inspired by Intercom
- 💬 Real-time AI-powered conversations
- 📝 Markdown rendering for AI responses
- 📱 Fully responsive design
- ⚡ Fast and smooth user experience
- 🎯 Friendly, helpful AI support agent

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```bash
VITE_OPENAI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual OpenAI API key.

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── Chat.tsx          # Main chat container component
│   ├── ChatHeader.tsx    # Header with title and close button
│   ├── ChatInput.tsx     # Input field with send button
│   ├── Message.tsx       # Individual message component
│   └── *.css            # Component-specific styles
├── services/
│   └── chatService.ts    # OpenAI API integration
├── App.tsx               # Root component
└── main.tsx              # Entry point
```

## Customization

### Changing the Brand Color

The default brand color for user messages is `#007bff` (blue). To change it:

1. Update the `--brand-color` CSS variable in `src/index.css`
2. Update the background color in `src/components/Message.css` for `.message-user .message-content`

### Modifying the AI Personality

Edit the system prompt in `src/services/chatService.ts` to change the AI's personality and behavior.

### Changing the Greeting Message

Update the initial message in `src/components/Chat.tsx`:

```typescript
const [messages, setMessages] = useState<MessageState[]>([
  {
    role: 'assistant',
    content: 'Your custom greeting here!',
  },
]);
```

## Important Security Note

⚠️ **This implementation uses the OpenAI API directly from the browser**, which exposes your API key in the client-side code. For production use, you should:

1. Create a backend API proxy to handle OpenAI requests
2. Store your API key securely on the server
3. Implement rate limiting and authentication

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **OpenAI SDK** - AI integration
- **react-markdown** - Markdown rendering
- **CSS Modules** - Component-scoped styling

## License

MIT
