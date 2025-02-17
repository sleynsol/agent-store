import { supabaseAdmin } from '@/services/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get count of all apps
    const { count, error } = await supabaseAdmin
      .from('apps')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch app count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to fetch app count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app count' },
      { status: 500 }
    );
  }
} 