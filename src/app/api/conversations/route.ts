import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const characterId = searchParams.get('characterId');

    if (!userId || !characterId) {
      return NextResponse.json(
        { error: '缺少 userId 或 characterId 参数' },
        { status: 400 },
      );
    }

    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .maybeSingle();

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, character_id } = body;

    if (!user_id || !character_id) {
      return NextResponse.json(
        { error: '缺少 user_id 或 character_id' },
        { status: 400 },
      );
    }

    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id,
        character_id,
        intimacy_level: 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // 唯一约束冲突 - 对话已存在，直接查询返回
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user_id)
          .eq('character_id', character_id)
          .single();

        return NextResponse.json(existing ?? { error: '对话已存在' });
      }
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
