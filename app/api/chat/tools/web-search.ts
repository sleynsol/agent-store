import { z } from 'zod';
import {tavily} from '@tavily/core'

interface DuckDuckGoResponse {
  Abstract: string;
  AbstractText: string;
  AbstractSource: string;
  RelatedTopics: Array<{
    Text?: string;
    Result?: string;
    FirstURL?: string;
  }>;
}

async function performWebSearch(query: string ) {
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
  try {
    const res = await tvly.search(query, {})
    console.log("web searched ", res)
    return res
  } catch(e) {
    return `No search results found for ${query}`
  }
}

async function performWebSearch2(query: string) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1&no_html=1&skip_disambig=1`
    );
    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data: DuckDuckGoResponse = await response.json();
    // Format search results
    let formattedResult = '';
    
    // Add abstract if available
    if (data.AbstractText) {
      formattedResult += `${data.AbstractText}\n\n`;
      if (data.AbstractSource) {
        formattedResult += `Source: ${data.AbstractSource}\n\n`;
      }
    }
    
    // Add related topics
    const relatedTopics = data.RelatedTopics
      .filter(topic => topic.Text)
      .slice(0, 3); // Limit to top 3 related results
      
    if (relatedTopics.length > 0) {
      formattedResult += 'Related Topics:\n';
      relatedTopics.forEach(topic => {
        if (topic.Text) {
          formattedResult += `• ${topic.Text}\n`;
        }
      });
    }

    if (!formattedResult) {
      return `No results found for "${query}"`;
    }

    return formattedResult.trim();
  } catch (error) {
    console.error('Web search error:', error);
    return `Search failed for "${query}". Please try again.`;
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