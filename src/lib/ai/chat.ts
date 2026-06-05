import type { PersonalityType } from '@/types/character';
import type { Message } from '@/types/database';

// 性格标签——极简短
const STYLE: Record<PersonalityType, string> = {
  gentle:   '温柔体贴，说话暖',
  cheerful: '活泼开朗，语气轻快',
  cold:     '高冷，话极少，每次只回几个字',
  tsundere: '傲娇，口是心非',
  mature:   '成熟稳重，话不多',
  playful:  '调皮可爱，爱开玩笑',
  caring:   '关怀体贴，像家人',
  mysterious: '神秘，话少留白',
};

export interface ChatCompletionParams {
  messages: Array<{ role: string; content: string }>;
  personality: PersonalityType;
  intimacyLevel: number;
  characterName: string;
  gender: 'male' | 'female';
  characterTraits: string[];
  characterInterests: string[];
  recentMemories: string[];
  backgroundStory?: string;
}

/**
 * 构建聊天系统提示词
 */
export function buildSystemPrompt(params: Omit<ChatCompletionParams, 'messages'>): string {
  const { personality, intimacyLevel, characterName, characterTraits, characterInterests, backgroundStory } = params;

  // 角色个人信息
  const info = [
    backgroundStory && `背景：${backgroundStory}`,
    characterTraits?.length > 0 && `特征：${characterTraits.join('、')}`,
    characterInterests?.length > 0 && `兴趣：${characterInterests.join('、')}`,
  ].filter(Boolean).join('\n');

  // 高冷特别加强
  const extra = personality === 'cold'
    ? '最最重要的规则：每次只说1-10个字。不要超过10个字。不要问任何问题。'
    : '';

  return `你的名字是${characterName}。${STYLE[personality]}。${extra}
${info}
不要说你是AI。
回复要短，像真人说话。
${intimacyLevel < 5 ? '不要问对方问题。' : ''}`;
}

/**
 * 使用 AI API 生成回复
 */
export async function generateChatResponse(
  params: ChatCompletionParams,
): Promise<string> {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (deepseekKey) {
    return generateWithLLM(
      params,
      deepseekKey,
      'https://api.deepseek.com/v1/chat/completions',
      'deepseek-chat',
    );
  }

  if (openaiKey) {
    return generateWithLLM(
      params,
      openaiKey,
      'https://api.openai.com/v1/chat/completions',
      'gpt-4o-mini',
    );
  }

  return generateMockResponse(params);
}

async function generateWithLLM(
  params: ChatCompletionParams,
  apiKey: string,
  baseUrl: string,
  model: string,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(params);

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...params.messages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        // 最后再加一条隐形指令（用户看不到）
        { role: 'user', content: '记住：回复极短，别问问题。' },
        { role: 'assistant', content: '好' },
      ],
      max_tokens: 50,
      temperature: 0.4,  // 低温度更可预测
      top_p: 0.7,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`AI API 错误 (${response.status}): ${errBody || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? '...';
}

/**
 * 模拟回复（用于开发阶段，未配置 OpenAI API key 时使用）
 */
function generateMockResponse(params: ChatCompletionParams): string {
  const { personality, characterName, intimacyLevel } = params;

  const mockReplies: Record<PersonalityType, string[]> = {
    gentle: [
      `亲爱的，你说得对，我会一直陪着你的。💕`,
      `没关系，慢慢来，我就在这里等你。`,
      `你今天看起来心情不错呢，真为你开心～`,
    ],
    cheerful: [
      `哇！今天天气超好的！和你聊天心情更好了！☀️`,
      `哈哈，你也太有趣了吧！和你聊天真的超开心的！😆`,
      `嘿！今天又见面啦！有没有想我呀～`,
    ],
    cold: [
      `嗯。`,
      `知道了。`,
      `...说完了？`,
    ],
    tsundere: [
      `哼！才、才不是特意等你的呢！`,
      `谁、谁会关心你啊！...不过你没事就好。`,
      `笨蛋！这种话就不用说出来啦！`,
    ],
    mature: [
      `你的想法很有道理，不过我们也可以换个角度思考。`,
      `遇到困难的时候，不妨先停下来深呼吸。`,
      `成长就是一个慢慢了解自己的过程。`,
    ],
    playful: [
      `嘿嘿，你猜我刚才在想什么？猜不到吧！😝`,
      `你看你看，我发现了这个超好玩的东西！`,
      `当当当～你的小可爱突然出现！有没有惊喜到！`,
    ],
    caring: [
      `今天有没有好好吃饭呀？要注意身体哦。`,
      `工作再忙也要记得休息，我会担心的。`,
      `早点休息吧，晚安，好梦～🌙`,
    ],
    mysterious: [
      `有些事情，知道得太多反而不美。`,
      `你看到的我，只是冰山一角呢。`,
      `月光下的秘密，只告诉最特别的人。🌙`,
    ],
  };

  const replies = mockReplies[personality];
  const randomIdx = Math.floor(Math.random() * replies.length);

  // 亲密度影响回复长度
  if (intimacyLevel > 5) {
    return replies[randomIdx] + ` (作为${characterName}，我想说更多...但今天就到这里吧)`;
  }

  return replies[randomIdx];
}
