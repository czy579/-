'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 表单验证
    if (!form.username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (form.username.length < 3) {
      setError('用户名至少3个字符');
      return;
    }
    if (form.password.length < 6) {
      setError('密码至少6个字符');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // 注册用户（资料由数据库触发器自动创建）
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username,
            display_name: form.display_name || form.username,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('该邮箱已注册');
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push('/login?registered=true');
      router.refresh();
    } catch {
      setError('注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="用户名"
          placeholder="your_name"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          minLength={3}
        />
        <Input
          label="显示名称"
          placeholder="你的昵称"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
        />
      </div>

      <Input
        label="邮箱"
        type="email"
        placeholder="your@email.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <Input
        label="密码"
        type="password"
        placeholder="至少6个字符"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={6}
      />

      <Input
        label="确认密码"
        type="password"
        placeholder="再次输入密码"
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        required
      />

      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        注册
      </Button>
    </form>
  );
}
