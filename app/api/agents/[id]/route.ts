import { supabaseAdmin } from '@/services/supabase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, context: any): Promise<NextResponse> {
  try {
    const { params } = context;
    const { id } = params as { id: string };

    // Verify that we have an ID
    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Delete the app from Supabase
    const { error } = await supabaseAdmin
      .from('apps')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
} 