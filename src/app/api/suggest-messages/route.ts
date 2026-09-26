import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST() {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { success: false, message: 'GEMINI_API_KEY is not set' },
      { status: 500 }
    );
  }

  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment. Return only the questions string, with no extra text, quotes or numbering.";

    const result = streamText({
      model: google('gemini-3.5-flash-lite'),
      prompt,
      maxOutputTokens: 400,
      // Gemini "thinks" before answering by default, which eats the token budget.
      // Three short questions need little reasoning, so keep thinking low.
      providerOptions: {
        google: { thinkingConfig: { thinkingLevel: 'low' } },
      },
      onError: ({ error }) => {
        console.error('Gemini streaming error:', error);
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { success: false, message: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
