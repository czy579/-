'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PersonalitySelector } from './PersonalitySelector';
import type { PersonalityType } from '@/types/database';

export function CharacterCreator() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    gender: 'female' as 'male' | 'female',
    personality: null as PersonalityType | null,
    description: '',
    greeting_message: '',
    background_story: '',
    traits: '',
    interests: '',
    is_public: false,
  });

  const handleNext = () => {
    if (step === 1 && !form.name.trim()) {
      setError('请输入角色名称');
      return;
    }
    if (step === 2 && !form.personality) {
      setError('请选择性格类型');
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleSubmit = async () => {
    if (!form.personality) {
      setError('请选择性格类型');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('请先登录');
        return;
      }

      const { error: insertError } = await supabase.from('characters').insert({
        user_id: user.id,
        name: form.name,
        personality: form.personality,
        description: form.description,
        greeting_message: form.greeting_message || `你好呀！我是${form.name}，很高兴认识你～`,
        background_story: form.background_story || null,
        traits: form.traits.split(/[,，、]/).map((t) => t.trim()).filter(Boolean),
        interests: form.interests.split(/[,，、]/).map((t) => t.trim()).filter(Boolean),
        is_public: form.is_public,
      });

      if (insertError) {
        setError('创建失败: ' + insertError.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('创建失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                s <= step
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 transition-colors ${
                  s < step ? 'bg-purple-500' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* 步骤 1: 基本信息 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">基本信息</h2>
            <p className="text-sm text-gray-400">给你的AI伴侣起个名字，简单描述一下</p>
          </div>

          <Input
            label="角色名称 *"
            placeholder="给你的AI伴侣起个名字"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={20}
          />

          {/* 性别选择 */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">性别</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, gender: 'female' })}
                className={`p-4 rounded-xl border text-center transition-all ${
                  form.gender === 'female'
                    ? 'border-pink-500 bg-pink-500/10 text-pink-300'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-1">👩</div>
                <div className="text-sm font-medium">女生</div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, gender: 'male' })}
                className={`p-4 rounded-xl border text-center transition-all ${
                  form.gender === 'male'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-1">👨</div>
                <div className="text-sm font-medium">男生</div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">简短描述</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 min-h-[100px] resize-none"
              placeholder="用一句话描述这个角色的特点..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">初次见面问候语</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 min-h-[80px] resize-none"
              placeholder="角色第一次见到你时会说什么？"
              value={form.greeting_message}
              onChange={(e) => setForm({ ...form, greeting_message: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleNext}>下一步</Button>
          </div>
        </div>
      )}

      {/* 步骤 2: 性格选择 */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">选择性格</h2>
            <p className="text-sm text-gray-400">选择一个适合的角色性格</p>
          </div>

          <PersonalitySelector
            value={form.personality}
            onChange={(p) => setForm({ ...form, personality: p })}
          />

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              上一步
            </Button>
            <Button onClick={handleNext}>下一步</Button>
          </div>
        </div>
      )}

      {/* 步骤 3: 详细设定 */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">详细设定</h2>
            <p className="text-sm text-gray-400">让角色更加丰满</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">背景故事</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 min-h-[120px] resize-none"
              placeholder="这个角色有怎样的过往经历？"
              value={form.background_story}
              onChange={(e) => setForm({ ...form, background_story: e.target.value })}
            />
          </div>

          <Input
            label="性格特征（用逗号分隔）"
            placeholder="温柔、细心、善解人意"
            value={form.traits}
            onChange={(e) => setForm({ ...form, traits: e.target.value })}
          />

          <Input
            label="兴趣爱好（用逗号分隔）"
            placeholder="阅读、音乐、绘画"
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">允许其他用户看到这个角色</span>
          </label>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              上一步
            </Button>
            <Button onClick={handleSubmit} isLoading={isLoading}>
              创建角色
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
