import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: '缺少 conversationId 参数' },
        { status: 400 },
      );
    }

    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '服务器错误' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversation_id, role, content } = body;

    if (!conversation_id || !role || !content) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 },
      );
    }

    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '服务器错误' },
      { status: 500 },
    );
  }
}
