import { NextResponse } from 'next/server';
import { tavily } from '@tavily/core';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    
    const res = await tvly.search(query, {});
    const response = `${res.answer}\n ${res.results}`;
    
    return NextResponse.json({ result: response });
  } catch (error) {
    console.error('Web search error:', error);
    return NextResponse.json(
      { error: `No search results found for the query` },
      { status: 500 }
    );
  }
} 