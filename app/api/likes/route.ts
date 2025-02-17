import { supabase } from '@/services/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { appId } = await request.json();

    // Convert appId to number
    const numericId = parseInt(appId, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid app ID' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('increment_flames', { 
      target_id: numericId
    });

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 404 });
    }

    return NextResponse.json({ likes: data });
  } catch (error) {
    console.error('Error updating flames:', error);
    return NextResponse.json({ error: 'Failed to update flames' }, { status: 500 });
  }
} 