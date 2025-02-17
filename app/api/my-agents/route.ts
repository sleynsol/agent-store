import { supabaseAdmin } from '@/services/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get creator wallet from URL params
    const { searchParams } = new URL(request.url);
    const creatorWallet = searchParams.get('wallet');

    if (!creatorWallet) {
      return NextResponse.json(
        { error: 'Creator wallet is required' },
        { status: 400 }
      );
    }

    // Fetch apps created by this wallet
    const { data: apps, error } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('creatorWallet', creatorWallet)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      );
    }

    return NextResponse.json(apps);
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
} 