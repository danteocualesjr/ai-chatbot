import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = apiKey
  ? new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
    })
  : null;

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
}

// Use OpenAI SDK types for vision messages
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const sendMessage = async (
  messages: Message[],
  imageData?: string
): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }

  try {
    // Determine if we need vision model (if there's an image)
    const needsVision = imageData !== undefined || 
      messages.some(msg => 
        Array.isArray(msg.content) && 
        msg.content.some((item: any) => item.type === 'image_url')
      );

    const model = needsVision ? 'gpt-4o-mini' : 'gpt-3.5-turbo';

    // Prepare messages with image if provided
    const preparedMessages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are a friendly and helpful customer support agent with vision capabilities. You can see and analyze images. Be patient, understanding, and always try to help the customer solve their problem. Use a warm, conversational tone. When analyzing images, describe what you see clearly and answer questions about them.',
      },
      ...messages.map(msg => {
        // If this is the last user message and we have an image, add it
        if (msg.role === 'user' && imageData && msg === messages[messages.length - 1]) {
          const textContent = typeof msg.content === 'string' ? msg.content : '';
          return {
            role: 'user',
            content: [
              { type: 'text', text: textContent || 'What\'s in this image?' },
              { 
                type: 'image_url', 
                image_url: { 
                  url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}` 
                } 
              },
            ],
          } as ChatCompletionMessageParam;
        }
        // Convert regular message
        return {
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : (msg.content as any),
        } as ChatCompletionMessageParam;
      }),
    ];

    const response = await openai.chat.completions.create({
      model,
      messages: preparedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'Sorry, I encountered an error. Please try again.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    if (error instanceof Error && error.message.includes('vision')) {
      throw new Error('Vision API error. Please ensure you have access to GPT-4 Vision models.');
    }
    throw new Error('Failed to get response from AI. Please check your API key and try again.');
  }
};

