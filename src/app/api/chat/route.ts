import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/ai/chat';
import type { PersonalityType } from '@/types/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messages,
      personality,
      intimacyLevel,
      characterName,
      characterTraits,
      characterInterests,
      recentMemories,
      backgroundStory,
    } = body;

    // 参数验证
    if (!messages?.length || !personality || !characterName) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 },
      );
    }

    if (!['gentle', 'cheerful', 'cold', 'tsundere', 'mature', 'playful', 'caring', 'mysterious'].includes(personality)) {
      return NextResponse.json(
        { error: '无效的性格类型' },
        { status: 400 },
      );
    }

    const content = await generateChatResponse({
      messages,
      personality: personality as PersonalityType,
      intimacyLevel: intimacyLevel ?? 1,
      characterName,
      gender: 'female',
      characterTraits: characterTraits ?? [],
      characterInterests: characterInterests ?? [],
      recentMemories: recentMemories ?? [],
      backgroundStory,
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'AI 回复生成失败' },
      { status: 500 },
    );
  }
}
