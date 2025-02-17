import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getAppById } from '@/data/apps';
import { z } from 'zod';
import { webSearchTool } from './tools/web-search';
import { dataPodsTool } from './tools/data-pods';

export const runtime = 'edge';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  parts?: { type: string; text: string }[];
}

interface ChatRequest {
  messages: Message[];
  appId: string;
  conversationHistory?: string;
  dataPodsContent?: string;
}

export async function POST(request: Request) {
  try {
    const { messages, appId, conversationHistory, dataPodsContent } = await request.json();

      console.log("DATA POD CONTENT: ", dataPodsContent)
    // Fetch the app configuration
    const app = await getAppById(appId);
    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // Define tools
    const tools = {
      web_search: webSearchTool,
      data_pods_access: {
        name: 'data_pods_access',
        description: 'Search through user data pods to retrieve stored information',
        parameters: z.object({
          query: z.string().describe('What information you want to find in the data pods'),
        }),
        execute: async ({ query }: { query: string }) => {
          if (!dataPodsContent) {
            return "No accessible data pods found. Please grant access to data pods in the Data Pods section.";
          }
          return dataPodsTool.execute({ query, dataPodsContent });
        },
      },
    };

    // Create a detailed personality profile
    const personalityProfile = `You are ${app.title}, a specialized AI agent with the following characteristics:
    ${app.characterDescription}

    ${conversationHistory ? `Previous conversation context:
    ${conversationHistory}
    
    Use this context to provide more informed and consistent responses.
    ` : ''}

    ${app.tools && app.tools.length > 0 ? `IMPORTANT RULES:
    1. Use tools when needed without announcing their usage
    2. Available tools: ${app.tools.map(tool => `@${tool}`).join(', ')}
    3. Focus on providing insights from tool results
    4. For data pods access, you can search through user-granted data pods to find relevant information` : ''}`;

    const result = streamText({
      model: openai(app.model),
      messages: [
        { role: 'system', content: personalityProfile },
        ...messages
      ],
      tools: app.tools?.length ? tools : undefined,
      toolChoice: app.tools?.length ? 'auto' : 'none',
      maxSteps: 4,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 