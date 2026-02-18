const PINNED_MODELS = [
  'groq/llama-3.3-70b-versatile',
  'groq/llama-3.1-8b-instant',
  'groq/mixtral-8x7b-32768',
  'groq/gemma2-9b-it',
] as const;

export async function GET() {
  try {
    const useGroq = !!process.env.GROQ_API_KEY;

    // Collect all models
    const allModels: Array<{ id: string; name: string; provider: string }> = [];

    // Fetch Groq models if configured
    if (useGroq) {
      try {
        const { Groq } = await import('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const groqModels = await groq.models.list();

        const groqModelList = Array.isArray(groqModels.data)
          ? groqModels.data
              .filter((m) => m.owned_by === 'groq')
              .map((m) => ({
                id: `groq/${m.id}`,
                name: m.id,
                provider: 'groq',
              }))
          : [];

        allModels.push(...groqModelList);
      } catch (groqError) {
        console.error('Failed to fetch Groq models:', groqError);
        // Fallback to pinned Groq models if fetch fails
        const pinnedGroqModels = PINNED_MODELS.filter((id) => id.startsWith('groq/'));
        allModels.push(
          ...pinnedGroqModels.map((id) => ({
            id,
            name: id,
            provider: id.split('/')[0] || 'other',
          }))
        );
      }
    }

    // If no models fetched from APIs, use pinned models
    if (allModels.length === 0) {
      allModels.push(
        ...PINNED_MODELS.map((id) => ({
          id,
          name: id,
          provider: id.split('/')[0] || 'other',
        }))
      );
    }

    // Remove duplicates based on ID
    const uniqueModels = Array.from(new Map(allModels.map((m) => [m.id, m])).values());

    // Sort by provider then name
    uniqueModels.sort((a, b) => {
      const provComp = a.provider.localeCompare(b.provider);
      if (provComp !== 0) return provComp;
      return a.name.localeCompare(b.name);
    });

    return new Response(JSON.stringify({ models: uniqueModels }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({
        models: PINNED_MODELS.map((id) => ({
          id,
          name: id,
          provider: id.split('/')[0] || 'other',
        })),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
