'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <h1 className="text-2xl font-bold text-white mb-1">欢迎回来</h1>
        <p className="text-gray-400 text-sm">登录你的 AI 伴侣账号</p>
      </CardHeader>

      <CardContent>
        <LoginForm />

        <p className="mt-6 text-center text-sm text-gray-400">
          还没有账号？{' '}
          <Link
            href="/register"
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            立即注册
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
