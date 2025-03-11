import { z } from 'zod';

async function performWebSearch(query: string) {
  try {
    // Use absolute URL for Edge Function compatibility
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/web-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Web search failed');
    }

    const data = await response.json();
    return data.result;
  } catch (e) {
    return `No search results found for ${query}`;
  }
}

export const webSearchTool = {
  name: 'web_search',
  description: 'Search the web for current information',
  parameters: z.object({
    query: z.string().describe('The search query'),
  }),
  execute: async ({ query }: { query: string }) => {
    return performWebSearch(query);
  },
}; 