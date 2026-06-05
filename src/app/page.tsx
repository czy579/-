'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  return (
    <div className="flex flex-col">
      {/* 英雄区域 */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          {/* 浮动图标 */}
          <div className="flex justify-center gap-6 mb-8">
            {['💕', '✨', '🌟', '💬', '🌙'].map((emoji, i) => (
              <span
                key={emoji}
                className="text-3xl animate-float"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold mb-6">
            你的
            <span className="text-gradient"> AI 灵魂伴侣</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            创建一个独一无二的 AI 虚拟伴侣，选择性格、设定背景，在每一次对话中建立情感连接。
            <br />
            从陌生到熟悉，从朋友到知己，见证关系的每一步成长。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-10">
                  进入我的伴侣空间
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="text-lg px-10">
                    开始体验
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg" className="text-lg px-8">
                    登录
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 功能介绍 */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            强大功能，<span className="text-gradient">温暖陪伴</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部 */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
        <p>AI 伴侣 &copy; {new Date().getFullYear()} — 用心创造，用 AI 陪伴</p>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '🎭',
    title: '多样性格',
    description: '从温柔到高冷，从开朗到神秘，8种性格任你选择，打造独一无二的 AI 伴侣。',
  },
  {
    icon: '💭',
    title: '长期记忆',
    description: 'AI 会记住你们的点点滴滴，从喜好到经历，每一次对话都让关系更进一步。',
  },
  {
    icon: '💕',
    title: '亲密度系统',
    description: '从陌生人到灵魂伴侣，10个亲密度等级，见证关系的每一步成长。',
  },
  {
    icon: '🎨',
    title: '角色自定义',
    description: '自定义角色的名字、性格、背景故事、爱好，创造最符合你理想的伴侣。',
  },
  {
    icon: '🤖',
    title: 'AI 驱动',
    description: '基于先进 AI 模型驱动的智能对话，自然流畅，让每次交流都充满温度。',
  },
  {
    icon: '🔒',
    title: '隐私安全',
    description: '你的数据安全有保障，私密对话只属于你。',
  },
];
