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
  content: string;
}

export const sendMessage = async (
  messages: Message[]
): Promise<string> => {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly and helpful customer support agent. Be patient, understanding, and always try to help the customer solve their problem. Use a warm, conversational tone.',
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Sorry, I encountered an error. Please try again.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get response from AI. Please check your API key and try again.');
  }
};

