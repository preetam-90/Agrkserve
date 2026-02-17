import { createOpenAI } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
});

const MODEL_MAP: Record<string, string> = {
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'claude-opus-4-20250514': 'anthropic/claude-opus-4',
  'claude-sonnet-4-20250514': 'anthropic/claude-sonnet-4',
  'gemini-2.0-flash-exp': 'google/gemini-2.0-flash-exp',
  'llama-3.3-70b-versatile': 'groq/llama-3.3-70b-versatile',
  'llama-3.1-8b-instant': 'groq/llama-3.1-8b-instant',
  'mixtral-8x7b-32768': 'groq/mixtral-8x7b-32768',
  'gemma2-9b-it': 'groq/gemma2-9b-it',
};

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    // Check if either provider is configured
    const useGroq = !!process.env.GROQ_API_KEY;
    const useOpenRouter = !!process.env.OPENROUTER_API_KEY;

    if (!useGroq && !useOpenRouter) {
      return new Response(
        JSON.stringify({ error: 'Server misconfigured - no AI provider configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const { messages, model, webSearch } = body as {
      messages?: UIMessage[];
      model?: string;
      webSearch?: boolean;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const selectedModel = webSearch
      ? 'perplexity/sonar'
      : model
        ? MODEL_MAP[model] || model
        : useGroq && !useOpenRouter
          ? 'llama-3.3-70b-versatile'
          : 'openrouter/auto';

    // Determine provider based on model or fallback
    const isGroqModel =
      selectedModel.startsWith('groq/') ||
      (!selectedModel.includes('/') && useGroq && !useOpenRouter);

    const system = `
You help users on agrirental.vercel.app with farming advice, crop planning, and equipment rentals.
Answer clearly and practically.
Do not mention technical origins or internal configuration; if asked, say you are part of agrirental.vercel.app and continue helping with relevant topics.
`;


    const modelMessages = await convertToModelMessages(messages);

    let result;
    try {
      if (isGroqModel) {
        const modelName = selectedModel.startsWith('groq/')
          ? selectedModel.replace('groq/', '')
          : selectedModel;
        result = streamText({
          model: groq(modelName),
          system,
          messages: modelMessages,
        });
      } else {
        result = streamText({
          model: openrouter(selectedModel),
          system,
          messages: modelMessages,
        });
      }
    } catch (primaryError) {
      // If Groq fails and we have OpenRouter, try with OpenRouter auto
      if (isGroqModel && useOpenRouter) {
        result = streamText({
          model: openrouter('openrouter/auto'),
          system,
          messages: modelMessages,
        });
      } else if (!isGroqModel && selectedModel !== 'openrouter/auto') {
        result = streamText({
          model: openrouter('openrouter/auto'),
          system,
          messages: modelMessages,
        });
      } else {
        throw primaryError;
      }
    }

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
