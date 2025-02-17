import { supabaseAdmin } from '@/services/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all public apps from Supabase
    const { data: apps, error } = await supabaseAdmin
      .from('apps')
      .select('*')
      .eq('isPublic', true)
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, traits, avatarNumber, description, creator, isPublic, tools } = body;

    if (!creator) {
      return NextResponse.json(
        { error: 'Creator wallet address is required' },
        { status: 400 }
      );
    }

    // Format traits array into bullet points
    const formattedTraits = traits.map((trait: string) => `\t•\t${trait}`).join('\n');

    // Create the app in Supabase
    const { data, error } = await supabaseAdmin
      .from('apps')
      .insert([
        {
          title,
          traits: formattedTraits,
          imageUrl: `https://rpmksfqpzamwgrmdqkzf.supabase.co/storage/v1/object/public/app_icons/${avatarNumber}.png`,
          characterDescription: description,
          model: 'o3-mini',
          provider: 'openai',
          flames: 0,
          creatorWallet: creator,
          isPublic: isPublic,
          tools: tools
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create agent' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
} 