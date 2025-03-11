import { z } from 'zod';
import {tavily} from '@tavily/core'

async function performWebSearch(query: string ) {
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
  try {
    const res = await tvly.search(query, {})
    console.log("web searched ", res)
    const response = `${res.answer}\n ${res.results}`
    return response
  } catch(e) {
    return `No search results found for ${query}`
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