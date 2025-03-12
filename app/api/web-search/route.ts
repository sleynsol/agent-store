import { NextResponse } from 'next/server';
import { tavily } from '@tavily/core';

// Remove the Edge runtime declaration to make it a regular serverless function

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  return new NextResponse(null, { headers, status: 200 });
}

export async function POST(request: Request) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { query } = await request.json();
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    
    const res = await tvly.search(query, {});
    const response = `${res.answer}\n ${res.results}`;
    
    return NextResponse.json({ result: response }, { headers });
  } catch (error) {
    console.error('Web search error:', error);
    return NextResponse.json(
      { error: `No search results found for the query` },
      { status: 500, headers }
    );
  }
} 