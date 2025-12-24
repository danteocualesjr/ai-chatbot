import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
});

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const sendMessage = async (
  messages: Message[]
): Promise<string> => {
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

