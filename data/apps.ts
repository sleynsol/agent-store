import { supabase } from '@/services/supabase';
import { App } from '@/types/app';

const PAGE_SIZE = 10;

export async function getApps(page: number = 0): Promise<App[]> {
  try {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('isPublic', true)
      .order('flames', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    // Debug log to see the actual data structure
    console.log("Database apps:", data?.map(app => ({ id: app.id, flames: app.flames })));
    return data || [];
  } catch (error) {
    console.error('Failed to fetch apps:', error);
    return [];
  }
}

export async function getAppById(id: string): Promise<App | null> {
  try {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch app:', error);
    return null;
  }
}