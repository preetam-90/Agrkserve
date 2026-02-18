/**
 * POST /api/chat
 *
 * Main AI chat API route for AgriServe.
 *
 * Model selection logic:
 *   - Web search enabled  → Tavily API context injection (auto-detect or manual toggle)
 *   - Media attachments   → meta-llama/llama-4-scout-17b-16e-instruct (vision, via Groq)
 *   - User selected model → mapped via MODEL_MAP or passed as-is
 *   - Default             → llama-3.1-8b-instant (fast, via Groq)
 *
 * When media is attached:
 *   - Images  → Injected as image parts into the last user message for vision analysis
 *   - Videos  → Described as text context in the last user message
 *   - Documents (TXT/CSV) → Extracted text injected as context
 *   - Documents (PDF/DOCX/XLSX) → URL and filename injected as text context
 *
 * Context is always preserved when switching models — full message history
 * is sent with every request (stateless design).
 */
import { groq } from '@ai-sdk/groq';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import type { TextPart, ImagePart, FilePart } from '@ai-sdk/provider-utils';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  formatSystemContextForPrompt,
  formatUserContextForPrompt,
  UserContext,
} from '@/lib/utils/system-context';
import { smartQuery, SmartQueryUserContext } from '@/lib/services/smart-query-service';
import {
  detectWebSearchIntent,
  performWebSearch,
  formatWebSearchContext,
} from '@/lib/services/tavily-search-service';

/**
 * Vision-enabled model for requests that include media attachments.
 * Supports image understanding, document analysis, and video context.
 */
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

/**
 * Default fast model for text-only conversations.
 */
const DEFAULT_TEXT_MODEL = 'llama-3.1-8b-instant';

/**
 * Maps short model aliases (from the frontend model selector) to their
 * fully-qualified model IDs used by Groq.
 */
const MODEL_MAP: Record<string, string> = {
  'llama-3.3-70b-versatile': 'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant': 'llama-3.1-8b-instant',
  'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
  'gemma2-9b-it': 'gemma2-9b-it',
  'llama-4-scout': VISION_MODEL,
};

export const maxDuration = 60;

/**
 * Media attachment shape sent from the frontend alongside the chat messages.
 * AI credentials (Cloudinary keys) are never included here — only the public URL.
 */
interface MediaAttachment {
  /** Cloudinary secure URL for the uploaded file */
  url: string;
  /** Cloudinary public_id — used only for deletion, never sent to the LLM */
  publicId: string;
  /** High-level category of the attachment */
  type: 'image' | 'video' | 'document';
  /** Original filename as uploaded by the user */
  name: string;
  /** MIME type of the file */
  mimeType: string;
  /**
   * Pre-extracted text content (populated client-side for TXT/CSV files).
   * Injected directly into the LLM context for RAG-style document analysis.
   */
  extractedText?: string;
}

/**
 * Extracts the text content from the latest user message in the message history.
 * Used to run smart queries against the platform database.
 */
function extractLatestUserMessage(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      const textParts = messages[i].parts
        .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map((part) => part.text);
      if (textParts.length > 0) {
        return textParts.join(' ');
      }
    }
  }
  return '';
}

/**
 * Builds the dynamic system prompt combining:
 *   1. AgriServe identity and rules
 *   2. Current IST date/time and Indian farming season
 *   3. Authenticated user context (name, role, location)
 *   4. Platform data from smart query (equipment, bookings, etc.)
 */
function buildSystemPrompt(
  userCtx: UserContext,
  platformData?: string,
  webSearchData?: string
): string {
  const systemContext = formatSystemContextForPrompt();
  const userContextStr = formatUserContextForPrompt(userCtx);

  let prompt = `You are **AgriServe AI** 🌾, the intelligent assistant for AgriServe — India's premier agricultural equipment rental platform (agrirental.vercel.app).

## Your Identity
- You are a helpful, knowledgeable agricultural technology assistant
- You specialize in farming equipment rental, agricultural practices, and Indian farming seasons
- You speak in a friendly, professional tone
- You are aware of current Indian farming seasons and can give contextual advice

## Current Context
${systemContext}

## User Context  
${userContextStr}

## Response Formatting Rules
- ALWAYS format responses in **rich markdown** (like ChatGPT/Gemini)
- Use headers (##, ###), bullet points, numbered lists, **bold**, *italics*
- Use tables for comparing data (equipment, bookings, etc.)
- Use emojis sparingly but effectively (🚜 🌾 ✅ ❌ 📊 💰 📋 ⭐ 👷 📍 🌐)
- Keep responses concise but comprehensive
- When showing data, present it in well-structured tables or lists

## Critical Rules
1. **NEVER fabricate data** — only use information from the PLATFORM DATA or WEB SEARCH RESULTS sections below. If data isn't provided, say "I don't have that information right now."
2. **NEVER invent equipment names, prices, users, or bookings** that aren't in the data
3. **NEVER expose sensitive user data** (emails, phones, addresses) unless the user is asking about their own profile
4. If the user asks about "my bookings", "my equipment", etc. and they are NOT logged in, politely ask them to log in first
5. If a user asks something outside the platform's scope, you can answer general agriculture questions but clarify you specialize in equipment rental
6. When discussing seasonal equipment, reference the current farming season context above
7. For pricing, always use ₹ (Indian Rupees) format
8. If the user is a farmer, prioritize rental suggestions; if a provider, focus on listing/management advice
9. Acknowledge the user by name when they first interact (if logged in)

## Platform Data
${platformData || 'No specific platform data available for this query. Answer based on general knowledge about the AgriServe platform.'}
`;

  if (webSearchData) {
    prompt += `

## Web Search Results (Live via Tavily 🌐)
${webSearchData}

### Web Search Display Rules
- Present **top 3–5 results** clearly in your response with this format:
  **[Result Title](URL)**
  *Short description/snippet...*
- Always include clickable markdown links [Title](URL) for every source cited
- If a "Quick Answer" is provided, show it prominently at the top of your response
- Add a "🌐 Web Sources" section at the bottom with numbered links
- For price information, always include ₹ currency and mention the approximate date
`;
  }

  return prompt;
}

export async function POST(request: Request) {
  try {
    const useGroq = !!process.env.GROQ_API_KEY;
    const useTavily = !!process.env.TAVILY_API_KEY;

    if (!useGroq) {
      return new Response(
        JSON.stringify({ error: 'Server misconfigured - GROQ_API_KEY is required' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { messages, model, webSearch, mediaAttachments } = body as {
      messages?: UIMessage[];
      model?: string;
      webSearch?: boolean;
      /** Media files uploaded by the user for this message */
      mediaAttachments?: MediaAttachment[];
    };

    console.log('[chat:debug] Request received:', {
      messageCount: messages?.length,
      model,
      webSearch,
      mediaAttachmentsCount: mediaAttachments?.length ?? 0,
      mediaAttachments: mediaAttachments?.map((a) => ({
        type: a.type,
        name: a.name,
        url: a.url,
        mimeType: a.mimeType,
      })),
    });

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Auth (optional — guests can chat too) ---
    let userContext: UserContext = { isAuthenticated: false };
    let smartQueryUserContext: SmartQueryUserContext | undefined;

    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!authError && user) {
        const adminClient = createAdminClient();
        const [profileRes, rolesRes] = await Promise.all([
          adminClient
            .from('user_profiles')
            .select('name, email, phone, roles, city, state, pincode')
            .eq('id', user.id)
            .single(),
          adminClient
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('is_active', true),
        ]);

        const profile = profileRes.data;
        const roles = (rolesRes.data || []).map((r: { role: string }) => r.role);

        userContext = {
          isAuthenticated: true,
          userId: user.id,
          name: profile?.name || user.user_metadata?.name || 'User',
          email: profile?.email || user.email,
          roles: roles.length > 0 ? roles : profile?.roles || [],
          activeRole: roles[0] || profile?.roles?.[0] || 'farmer',
          location: {
            city: profile?.city,
            state: profile?.state,
            pincode: profile?.pincode,
          },
        };

        smartQueryUserContext = {
          userId: user.id,
          roles: userContext.roles,
          activeRole: userContext.activeRole,
          isAdmin: userContext.roles?.includes('admin') || false,
        };
      }
    } catch (e) {
      console.warn('[chat] Auth check failed, continuing as guest:', e);
    }

    // --- Model selection ---
    // Priority: hasMedia (vision) > user-selected > default
    // Note: webSearch now uses Tavily API for context injection, not Perplexity routing
    const hasMedia = Array.isArray(mediaAttachments) && mediaAttachments.length > 0;

    const selectedModel: string = hasMedia
      ? VISION_MODEL
      : model
        ? MODEL_MAP[model] || model
        : DEFAULT_TEXT_MODEL;

    console.log('[chat:debug] Model selection:', { hasMedia, selectedModel, inputModel: model });

    // --- Smart query for platform data ---
    const latestUserMessage = extractLatestUserMessage(messages);
    let smartResult: { context: string; hasContext: boolean } = { context: '', hasContext: false };

    if (latestUserMessage) {
      try {
        smartResult = await smartQuery(latestUserMessage, smartQueryUserContext);
      } catch (queryError) {
        console.error('[chat] Smart query failed, continuing without platform data:', queryError);
      }
    }

    // --- Tavily web search (if API key set and query is relevant) ---
    let webSearchContext: string | undefined;

    if (useTavily && latestUserMessage) {
      const shouldSearch = webSearch === true || detectWebSearchIntent(latestUserMessage);
      if (shouldSearch) {
        try {
          const searchResponse = await performWebSearch(latestUserMessage);
          if (searchResponse && searchResponse.results.length > 0) {
            webSearchContext = formatWebSearchContext(searchResponse);
            console.info(
              `[chat] Tavily: ${searchResponse.results.length} results (${searchResponse.fromCache ? 'cached' : 'live'})`
            );
          }
        } catch (searchError) {
          console.warn('[chat] Tavily search failed, continuing without web context:', searchError);
        }
      }
    }

    // --- Build system prompt ---
    const system = buildSystemPrompt(
      userContext,
      smartResult.hasContext ? smartResult.context : undefined,
      webSearchContext
    );

    // --- Convert UI messages to model messages ---
    let modelMessages = await convertToModelMessages(messages);

    /**
     * When media is attached, inject the files into the last user message
     * so the vision model can analyse them.
     *
     * - Images → added as 'image' parts (Vercel AI SDK / Groq vision format)
     * - Videos → added as descriptive text context
     * - Documents (TXT/CSV with extractedText) → full content injected as text
     * - Documents (PDF/DOCX/XLSX) → URL + filename injected as text reference
     */
    if (hasMedia && modelMessages.length > 0) {
      const lastIndex = modelMessages.length - 1;
      const lastMsg = modelMessages[lastIndex];

      if (lastMsg.role === 'user') {
        // Normalise existing content to a typed array of AI SDK parts
        const existingContent: (TextPart | ImagePart | FilePart)[] =
          typeof lastMsg.content === 'string'
            ? [{ type: 'text' as const, text: lastMsg.content }]
            : (lastMsg.content as (TextPart | ImagePart | FilePart)[]);

        // Build enriched content with media parts appended
        const enrichedContent: (TextPart | ImagePart | FilePart)[] = [...existingContent];

        for (const attachment of mediaAttachments!) {
          if (attachment.type === 'image') {
            /**
             * Image attachment: pass as 'image' part so the vision model
             * can directly analyse the visual content.
             */
            enrichedContent.push({
              type: 'image' as const,
              image: new URL(attachment.url),
            } as ImagePart);
          } else if (attachment.type === 'video') {
            /**
             * Video attachment: describe as text context.
             * Direct video frame analysis is not supported by most LLM APIs yet.
             */
            enrichedContent.push({
              type: 'text' as const,
              text: `\n\n📹 [User attached a video file: "${attachment.name}" (${attachment.mimeType})\nVideo URL: ${attachment.url}\nPlease acknowledge the video and answer any questions the user has about it.]`,
            });
          } else if (attachment.type === 'document') {
            /**
             * Document attachment:
             *   - TXT/CSV: extracted text is injected for full content analysis (RAG-style)
             *   - PDF/DOCX/XLSX: URL and filename are injected as a reference
             */
            const docContext = attachment.extractedText
              ? `\n\n📄 [User attached a document: "${attachment.name}" (${attachment.mimeType})\n\n--- Document Content (first 8000 chars) ---\n${attachment.extractedText.slice(0, 8000)}\n--- End Document Content ---\n]`
              : `\n\n📄 [User attached a document: "${attachment.name}" (${attachment.mimeType})\nDocument URL: ${attachment.url}\nPlease acknowledge the document and assist the user with any questions about its contents.]`;

            enrichedContent.push({ type: 'text' as const, text: docContext });
          }
        }

        // Replace last message with enriched version
        modelMessages = [
          ...modelMessages.slice(0, lastIndex),
          { role: 'user' as const, content: enrichedContent },
        ];
      }
    }

    if (hasMedia) {
      const lastMsg = modelMessages[modelMessages.length - 1];
      console.log('[chat:debug] Enriched last message:', {
        role: lastMsg?.role,
        contentType: typeof lastMsg?.content,
        contentLength: Array.isArray(lastMsg?.content) ? lastMsg.content.length : 'N/A',
        parts: Array.isArray(lastMsg?.content)
          ? lastMsg.content.map((p: { type: string; image?: unknown; text?: string }) => ({
              type: p.type,
              hasImage: 'image' in p,
              imageType: p.image ? typeof p.image : undefined,
              textPreview: p.text ? p.text.slice(0, 50) : undefined,
            }))
          : undefined,
      });
    }

    // --- Route to correct AI provider and call streamText ---
    let result;

    if (selectedModel === VISION_MODEL) {
      /**
       * Vision model route: use Groq SDK directly.
       * Groq supports meta-llama/llama-4-scout-17b-16e-instruct with vision.
       */
      result = streamText({
        model: groq(VISION_MODEL),
        system,
        messages: modelMessages,
      });
    } else {
      /**
       * Standard Groq model route.
       * Strips the 'groq/' prefix to get the bare model name.
       */
      const modelName = selectedModel.startsWith('groq/')
        ? selectedModel.replace('groq/', '')
        : selectedModel;

      result = streamText({
        model: groq(modelName),
        system,
        messages: modelMessages,
      });
    }

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[/api/chat] Unhandled error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
